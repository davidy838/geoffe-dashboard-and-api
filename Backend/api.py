from flask import Blueprint, request, jsonify, send_file
import pandas as pd
import requests
from geopy.distance import geodesic
import os
import time
import re
import unicodedata
import traceback

bp = Blueprint('api', __name__)

@bp.route('/calculate-distances-and-merge-costs', methods=['POST'])
def calculate_distances_and_merge_costs():
    """
    Combined route that:
    1. Runs /calculate-leaflet-distances with community_file and clinic_file
    2. Uses the output as community_file input for /merge-community-costs-65plus
    3. Also requires charlie_file and costs_file for the cost merging step
    
    Total inputs: 4 files
    - community_file: CSV with Title, Latitude, Longitude
    - clinic_file: CSV with Facility, latitude, longitude  
    - charlie_file: CSV with community_name, age_group encounters
    - costs_file: CSV with cost equations
    """
    try:
        print("Starting combined distance calculation and cost merging process...")
        
        # Get all four required input files from request
        community_file = request.files.get('community_file')
        clinic_file = request.files.get('clinic_file')
        charlie_file = request.files.get('charlie_file')
        costs_file = request.files.get('costs_file')

        if not all([community_file, clinic_file, charlie_file, costs_file]):
            return jsonify({"error": "Missing required files. Need: community_file, clinic_file, charlie_file, costs_file"}), 400

        print("Step 1: Running distance calculations...")
        
        # Step 1: Run the distance calculation process
        # This replicates the logic from /calculate-leaflet-distances
        print("Reading input files for distance calculations...")
        
        # Try different encodings for reading CSV files
        encodings = ['utf-8', 'latin1', 'ISO-8859-1', 'cp1252']
        
        # Read community file
        for encoding in encodings:
            try:
                community_file.seek(0)  # Reset file pointer
                community_df = pd.read_csv(community_file, encoding=encoding)
                print(f"Successfully read community file with {encoding} encoding")
                print(f"Community file shape: {community_df.shape}")
                print(f"Community file columns: {community_df.columns.tolist()}")
                break
            except UnicodeDecodeError:
                continue
        else:
            return jsonify({"error": "Could not read community file with any supported encoding"}), 400

        # Read clinic file
        for encoding in encodings:
            try:
                clinic_file.seek(0)  # Reset file pointer
                clinic_df = pd.read_csv(clinic_file, encoding=encoding)
                print(f"Successfully read clinic file with {encoding} encoding")
                print(f"Clinic file shape: {clinic_df.shape}")
                print(f"Clinic file columns: {clinic_df.columns.tolist()}")
                break
            except UnicodeDecodeError:
                continue
        else:
            return jsonify({"error": "Could not read clinic file with any supported encoding"}), 400

        print(f"Processing {len(community_df)} communities and {len(clinic_df)} clinics")

        # Check for required columns in community file
        community_required = ['Title', 'Latitude', 'Longitude']
        community_missing = [col for col in community_required if col not in community_df.columns]
        if community_missing:
            return jsonify({"error": f"Community file is missing required columns: {', '.join(community_missing)}"}), 400

        # Check for required columns in clinic file
        clinic_required = ['Facility', 'latitude', 'longitude']
        clinic_missing = [col for col in clinic_required if col not in clinic_df.columns]
        if clinic_missing:
            return jsonify({"error": f"Clinic file is missing required columns: {', '.join(clinic_missing)}"}), 400

        # Rename clinic columns for consistency
        clinic_df.rename(columns={'latitude': 'Latitude', 'longitude': 'Longitude', 'Facility': 'Facility Name'}, inplace=True)

        # Convert Title columns to string type
        community_df['Title'] = community_df['Title'].astype(str)
        clinic_df['Facility Name'] = clinic_df['Facility Name'].astype(str)

        # Clean and validate coordinates
        print("Validating coordinates...")
        community_df = community_df.dropna(subset=['Latitude', 'Longitude'])
        clinic_df = clinic_df.dropna(subset=['Latitude', 'Longitude'])
        
        # Convert coordinates to float
        try:
            community_df['Latitude'] = community_df['Latitude'].astype(float)
            community_df['Longitude'] = community_df['Longitude'].astype(float)
            clinic_df['Latitude'] = clinic_df['Latitude'].astype(float)
            clinic_df['Longitude'] = clinic_df['Longitude'].astype(float)
        except (ValueError, TypeError) as e:
            return jsonify({"error": f"Invalid coordinate values: {str(e)}"}), 400

        print(f"After validation: {len(community_df)} communities and {len(clinic_df)} clinics with valid coordinates")

        # Step 2: Calculate distances using Leaflet routing (complete logic from calculate-leaflet-distances)
        print("Step 2: Calculating distances using Leaflet routing...")
        
        # Function to get real routing distance and duration from OSRM (free, no API key required)
        def get_routing_distance(start_lat, start_lng, end_lat, end_lng):
            try:
                # OSRM free API endpoint (no API key required)
                url = f"https://router.project-osrm.org/route/v1/driving/{start_lng},{start_lat};{end_lng},{end_lat}?overview=false"
                
                # Make API request
                response = requests.get(url, timeout=30)
                
                if response.status_code == 200:
                    data = response.json()
                    if 'routes' in data and len(data['routes']) > 0:
                        route = data['routes'][0]
                        distance_km = route['distance'] / 1000  # Convert meters to km
                        duration_hours = route['duration'] / 3600  # Convert seconds to hours
                        return distance_km, duration_hours
                    else:
                        print(f"Warning: No route found for coordinates")
                        return None, None
                else:
                    print(f"Warning: API request failed with status {response.status_code}")
                    return None, None
                    
            except Exception as e:
                    print(f"Warning: Error getting routing data: {str(e)}")
                    return None, None

        # Calculate distances for each community to clinics
        print("Calculating distances for each community to clinics...")
        
        results = []
        for _, community in community_df.iterrows():
            community_name = community['Title']
            community_lat = community['Latitude']
            community_lng = community['Longitude']
            
            # Calculate haversine distances to all clinics
            clinic_distances = []
            for _, clinic in clinic_df.iterrows():
                clinic_name = clinic['Facility Name']
                clinic_lat = clinic['Latitude']
                clinic_lng = clinic['Longitude']
                
                # Calculate haversine distance
                haversine_distance = geodesic((community_lat, community_lng), (clinic_lat, clinic_lng)).km
                
                clinic_distances.append({
                    'clinic_name': clinic_name,
                    'clinic_lat': clinic_lat,
                    'clinic_lng': clinic_lng,
                    'haversine_distance': haversine_distance
                })
            
            # Sort by haversine distance and get top 3
            clinic_distances.sort(key=lambda x: x['haversine_distance'])
            top_3_clinics = clinic_distances[:3]
            
            print(f"Community '{community_name}': Top 3 closest clinics by haversine:")
            for i, clinic in enumerate(top_3_clinics):
                print(f"  {i+1}. {clinic['clinic_name']}: {clinic['haversine_distance']:.2f} km")
            
            # Use real routing API for the 3 closest clinics to find the actual closest one
            print(f"Using real routing API for top 3 clinics to find actual closest...")
            
            leaflet_distances = []
            for clinic in top_3_clinics:
                # Get real routing distance and duration from OSRM
                routing_distance, routing_duration = get_routing_distance(
                    community_lat, community_lng, 
                    clinic['clinic_lat'], clinic['clinic_lng']
                )
                
                # If routing API fails, fall back to geodesic
                if routing_distance is None:
                    routing_distance = geodesic((community_lat, community_lng), (clinic['clinic_lat'], clinic['clinic_lng'])).km
                    routing_duration = routing_distance / 60.0  # Estimate duration
                    print(f"  -> Using fallback geodesic calculation for {clinic['clinic_name']}")
                else:
                    print(f"  -> Got real routing data for {clinic['clinic_name']}: {routing_distance:.2f} km, {routing_duration:.2f} hours")
                
                # Estimate CO2 emissions (assuming average car emissions of 0.2 kg CO2 per km)
                estimated_co2 = routing_distance * 0.2
                
                # Ensure all required keys are present
                clinic_data = {
                    'clinic_name': clinic['clinic_name'],
                    'clinic_lat': clinic['clinic_lat'],
                    'clinic_lng': clinic['clinic_lng'],
                    'leaflet_distance': routing_distance,
                    'estimated_duration': routing_duration,
                    'estimated_co2': estimated_co2,
                    'haversine_distance': clinic['haversine_distance']
                }
                
                leaflet_distances.append(clinic_data)
            
            # Find the closest clinic using real routing calculations
            closest_clinic = min(leaflet_distances, key=lambda x: x['leaflet_distance'])
            
            print(f"  -> Closest clinic by real routing: {closest_clinic['clinic_name']} ({closest_clinic['leaflet_distance']:.2f} km)")
            
            # Calculate comprehensive costs for all service types and age groups
            print(f"Calculating comprehensive costs for all service types and age groups...")
            
            # Constants for cost calculations
            WAGE = 30.54
            MEAL_COST = 15
            ACCOMM = 100
            CAR_COST = 0.48
            DATA_USAGE = 1.25
            
            # Service types and their parameters
            services = {
                'MD': {'parking': 3, 'time': 0.76},
                'ED_CTAS_1': {'parking': 7.5, 'time': 3.9},
                'ED_CTAS_4': {'parking': 7.5, 'time': 2.7},
                'Hosp': {'parking': 16.5, 'time': 53.6},
                'Virtual': {'parking': 0, 'time': 0.62}
            }
            
            # Age groups and their caregiver coefficients
            age_groups = {
                '0-14': {'caregiver_coeff': 1, 'hospital_coeff': 0.75},
                '15-64': {'caregiver_coeff': 0.5, 'hospital_coeff': 0.25},
                '65+': {'caregiver_coeff': 0.5, 'hospital_coeff': 0.25}
            }
            
            # Calculate travel cost (round trip)
            travel_cost = closest_clinic['leaflet_distance'] * 2 * CAR_COST  # Double for roundtrip
            duration_hours = closest_clinic['estimated_duration'] * 2  # Double for roundtrip
            
            # Calculate costs for all 15 combinations
            all_costs = {}
            for service_type, service_params in services.items():
                for age_group, age_params in age_groups.items():
                    # Calculate lost productivity (only for 15-64 age group)
                    if age_group == '15-64':
                        if service_type == 'Virtual':
                            lost_productivity = WAGE * service_params['time']
                        else:
                            lost_productivity = WAGE * (service_params['time'] + duration_hours)
                    else:
                        lost_productivity = 0
                    
                    # Calculate informal caregiving
                    if service_type == 'Virtual':
                        informal_caregiving = age_params['caregiver_coeff'] * WAGE * service_params['time']
                    else:
                        informal_caregiving = age_params['caregiver_coeff'] * WAGE * (service_params['time'] + duration_hours)
                    
                    # Calculate out of pocket costs
                    if service_type == 'MD':
                        out_of_pocket = service_params['parking'] + travel_cost
                    elif service_type in ['ED_CTAS_1', 'ED_CTAS_4']:
                        out_of_pocket = service_params['parking'] + MEAL_COST + travel_cost
                    elif service_type == 'Hosp':
                        out_of_pocket = (travel_cost + 
                                       (ACCOMM * 2 * age_params['hospital_coeff']) + 
                                       (MEAL_COST * 3 * 2 * age_params['hospital_coeff']) + 
                                       service_params['parking'])
                    else:  # Virtual
                        out_of_pocket = DATA_USAGE
                    
                    # Calculate total unit cost
                    total_unit_cost = lost_productivity + informal_caregiving + out_of_pocket
                    
                    # Store results with a clear key format
                    key = f"{service_type}_{age_group}"
                    all_costs[key] = {
                        "lost_productivity": lost_productivity,
                        "informal_caregiving": informal_caregiving,
                        "out_of_pocket": out_of_pocket,
                        "total_unit_cost": total_unit_cost
                    }
            
            print(f"  -> Calculated costs for {len(all_costs)} service-age combinations")
            
            # Add to results
            results.append({
                'Title': community_name,
                'Latitude': community_lat,
                'Longitude': community_lng,
                'Nearest Clinic': closest_clinic['clinic_name'],
                'Clinic Latitude': closest_clinic['clinic_lat'],
                'Clinic Longitude': closest_clinic['clinic_lng'],
                'Google Distance (km)': round(closest_clinic['leaflet_distance'], 2),
                'Haversine Distance (km)': round(closest_clinic['haversine_distance'], 2),
                'Duration (hours)': round(closest_clinic['estimated_duration'], 2),
                'Estimated CO2 (kg)': round(closest_clinic['estimated_co2'], 2),
                'Distance Difference (Leaflet - Haversine)': round(closest_clinic['leaflet_distance'] - closest_clinic['haversine_distance'], 2),
                'Round Trip Distance (km)': round(closest_clinic['leaflet_distance'] * 2, 2),
                'Round Trip Duration (hours)': round(duration_hours, 2),
                'Travel Cost ($)': round(travel_cost, 2)
            })
            
            # Add all cost combinations to the result
            for service_age, costs in all_costs.items():
                results[-1][f"{service_age}_lost_productivity"] = round(costs["lost_productivity"], 2)
                results[-1][f"{service_age}_informal_caregiving"] = round(costs["informal_caregiving"], 2)
                results[-1][f"{service_age}_out_of_pocket"] = round(costs["out_of_pocket"], 2)
                results[-1][f"{service_age}_total_unit_cost"] = round(costs["total_unit_cost"], 2)

        # Create DataFrame from results
        result_df = pd.DataFrame(results)
        
        print(f"Distance calculations completed. Result shape: {result_df.shape}")
        
        # Step 3: Now run the cost merging process (complete logic from merge-community-costs-65plus)
        print("Step 3: Running cost merging process...")
        
        # Reset file pointers for the cost merging files
        charlie_file.seek(0)
        costs_file.seek(0)
        
        # Read the CHARLiE encounters file
        try:
            charlie_df = pd.read_csv(charlie_file)
            print(f"Successfully read charlie file with columns: {charlie_df.columns.tolist()}")
            # Strip whitespace from community names
            charlie_df['community_name'] = charlie_df['community_name'].str.strip()
        except Exception as e:
            return jsonify({"error": f"Error reading charlie file: {str(e)}"}), 400

        # Read the costs file
        try:
            costs_df = pd.read_csv(costs_file)
            print(f"Successfully read costs file with columns: {costs_df.columns.tolist()}")
            
            # Check if we have enough columns
            if len(costs_df.columns) < 2:
                return jsonify({"error": "Costs file must have at least 2 columns"}), 400
                
            # Print the first few rows to debug
            print("First few rows of costs file:")
            print(costs_df.head())
            
            # Find the row with equations (first non-empty row after header)
            equation_row = None
            for i in range(len(costs_df)):
                if not costs_df.iloc[i].isna().all():
                    equation_row = i
                    break
            
            if equation_row is None:
                return jsonify({"error": "No equations found in costs file"}), 400
                
            print(f"Found equations in row {equation_row}")
            
            # Get the equation row
            equations = costs_df.iloc[equation_row]
            print(f"Equations found: {equations.to_dict()}")
            
            # Validate equations
            if equations.isna().all():
                return jsonify({"error": "No valid equations found in costs file"}), 400
        except Exception as e:
            return jsonify({"error": f"Error reading costs file: {str(e)}"}), 400

        

        def norm_name(s: str) -> str:
            if pd.isna(s):
                return s
            s = str(s)
            s = unicodedata.normalize("NFKC", s)            # normalize unicode width/compatibility
            s = s.replace("\u00A0", " ")                    # NBSP -> space
            s = s.replace("\u2013", "-").replace("\u2014", "-")  # en/em dashes -> hyphen
            s = s.strip()
            s = re.sub(r"\s+", " ", s)                      # collapse whitespace
            return s

        # just before merging encounters
        result_df["Title_norm"] = result_df["Title"].map(norm_name)
        charlie_df["community_name_norm"] = charlie_df["community_name"].map(norm_name)

        result_df = result_df.merge(
            charlie_df[['community_name_norm', 'Encounters 0-14', 'Encounters 15-64', 'Encounters 65+']],
            left_on='Title_norm',
            right_on='community_name_norm',
            how='left'
        ).drop(columns=['community_name_norm'])
        
        # Fill NaN values with 0
        result_df['Encounters 0-14'] = result_df['Encounters 0-14'].fillna(0)
        result_df['Encounters 15-64'] = result_df['Encounters 15-64'].fillna(0)
        result_df['Encounters 65+'] = result_df['Encounters 65+'].fillna(0)
        
        # Debug: Print encounter values
        print("Encounter values after merge:")
        print(f"0-14 encounters: {result_df['Encounters 0-14'].sum()}")
        print(f"15-64 encounters: {result_df['Encounters 15-64'].sum()}")
        print(f"65+ encounters: {result_df['Encounters 65+'].sum()}")
        
        # Drop the temporary merge column
        if 'community_name' in result_df.columns:
            result_df = result_df.drop(columns=['community_name'])

        # Ensure columns exist before assignment
        required_columns = costs_df.columns.tolist()
        for col in required_columns:
            if col not in result_df.columns:
                result_df[col] = 0

        # Process each equation column (complete cost calculation logic)
        print("Processing cost equations...")
        for col in costs_df.columns:
            # Get the equation for this column
            equation = equations[col]
            if pd.isna(equation):
                continue
            
            # Clean up the equation by removing line breaks and extra spaces
            equation = ' '.join(equation.split())
            print(f"Processing equation for {col}: {equation}")
            
            # Debug: Check if equation uses 65+ encounters
            if 'Encounters 65+' in equation:
                print(f"  -> Equation uses 65+ encounters!")
            else:
                print(f"  -> Equation does NOT use 65+ encounters")
            
            try:
                # Create a function that will be applied to each row
                def evaluate_equation(row):
                    try:
                        # Create a dictionary of all available variables
                        variables = {}
                        
                        # First, add the encounter variables
                        variables['Encounters 0-14'] = row['Encounters 0-14']
                        variables['Encounters 15-64'] = row['Encounters 15-64']
                        variables['Encounters 65+'] = row['Encounters 65+']
                        
                        # Add all other row values to the variables dictionary
                        for var in row.index:
                            if var not in ['Encounters 0-14', 'Encounters 15-64', 'Encounters 65+']:
                                variables[var] = row[var]
                        
                        # Replace variable names in the equation with their values
                        eval_str = equation
                        
                        # Sort variables by length (longest first) to handle nested names
                        sorted_vars = sorted(variables.keys(), key=len, reverse=True)
                        for var_name in sorted_vars:
                            # Replace the variable name with its value, ensuring it's treated as a single variable
                            eval_str = eval_str.replace(var_name, str(variables[var_name]))
                        
                        # Replace 'Distance' with 'Leaflet Distance (km)' if present
                        eval_str = eval_str.replace('Distance', 'Google Distance (km)')
                        
                        # Evaluate the equation
                        result = eval(eval_str)
                        return float(result) if isinstance(result, (int, float)) else 0
                    except Exception as e:
                        print(f"Error evaluating equation for {col}: {str(e)}")
                        print(f"Equation was: {equation}")
                        print(f"Evaluated string was: {eval_str}")
                        print(f"Variables were: {variables}")
                        return 0
                
                # Apply the function to all rows at once
                result_df[col] = result_df.apply(evaluate_equation, axis=1)
                
            except Exception as e:
                print(f"Error processing column {col}: {str(e)}")
                print(f"Original equation: {equation}")
                result_df[col] = 0

        # Print all column names for debugging
        print("All columns in DataFrame:", result_df.columns.tolist())
        
        # Get only the actual total unit cost columns (not LOP/OOP/ICG variants)
        with_encounter_cost_cols = [col for col in result_df.columns
                                    if col.startswith('WITH_Encounter_Costs_')]
        without_encounter_cost_cols = [col for col in result_df.columns
                                    if col.startswith('WITHOUT_Encounter_Costs_')]

        # Now safely calculate total savings
        with_encounter_sum = result_df[with_encounter_cost_cols].sum().sum() if with_encounter_cost_cols else 0
        without_encounter_sum = result_df[without_encounter_cost_cols].sum().sum() if without_encounter_cost_cols else 0
        total_savings = without_encounter_sum - with_encounter_sum

        # 2. Patient-side cost breakdowns (for separate reporting)
        with_lop_sum = result_df.filter(like='lost_productivity_WITH_Encounter').sum().sum()
        without_lop_sum = result_df.filter(like='lost_productivity_WITHOUT_Encounter').sum().sum()
        total_LOP = without_lop_sum - with_lop_sum

        with_oop_sum = result_df.filter(like='out_of_pocket_WITH_Encounter').sum().sum()
        without_oop_sum = result_df.filter(like='out_of_pocket_WITHOUT_Encounter').sum().sum()
        total_OOP = without_oop_sum - with_oop_sum

        with_icg_sum = result_df.filter(like='informal_caregiving_WITH_Encounter').sum().sum()
        without_icg_sum = result_df.filter(like='informal_caregiving_WITHOUT_Encounter').sum().sum()
        total_ICG = without_icg_sum - with_icg_sum

        # Calculate total distance savings using exact column names
        with_distance_sum = result_df['WITH_total_distance'].sum() if 'WITH_total_distance' in result_df.columns else 0
        without_distance_sum = result_df['WITHOUT_total_distance'].sum() if 'WITHOUT_total_distance' in result_df.columns else 0
        total_distance_savings = without_distance_sum - with_distance_sum

        # Calculate total duration savings using exact column names
        with_duration_sum = result_df['WITH_total_duration'].sum() if 'WITH_total_duration' in result_df.columns else 0
        without_duration_sum = result_df['WITHOUT_total_duration'].sum() if 'WITHOUT_total_duration' in result_df.columns else 0
        total_duration_savings = without_duration_sum - with_duration_sum

        # Calculate total CO2 savings using exact column names
        with_co2_sum = result_df['WITH_total_CO2'].sum() if 'WITH_total_CO2' in result_df.columns else 0
        without_co2_sum = result_df['WITHOUT_total_CO2'].sum() if 'WITHOUT_total_CO2' in result_df.columns else 0
        total_co2_savings = without_co2_sum - with_co2_sum

        # Calculate total trips savings using exact column names
        with_trips_sum = result_df['WITH_total_trips'].sum() if 'WITH_total_trips' in result_df.columns else 0
        without_trips_sum = result_df['WITHOUT_total_trips'].sum() if 'WITHOUT_total_trips' in result_df.columns else 0
        total_trips_savings = without_trips_sum - with_trips_sum

        # Print the sums for debugging
        print(f"With Distance Sum: {with_distance_sum}")
        print(f"Without Distance Sum: {without_distance_sum}")
        print(f"With Duration Sum: {with_duration_sum}")
        print(f"Without Duration Sum: {without_duration_sum}")
        print(f"With CO2 Sum: {with_co2_sum}")
        print(f"Without CO2 Sum: {without_co2_sum}")
        print(f"With Trips Sum: {with_trips_sum}")
        print(f"Without Trips Sum: {without_trips_sum}")

        # Append the summary row to the DataFrame
        summary_row = pd.DataFrame({
            'Title': ['Summary'],
            'WITH LOP': [with_lop_sum],
            'WITHOUT LOP': [without_lop_sum],
            'Total LOP Savings': [total_LOP],
            'WITH OOP': [with_oop_sum],
            'WITHOUT OOP': [without_oop_sum],
            'Total OOP Savings': [total_OOP],
            'WITH ICG': [with_icg_sum],
            'WITHOUT ICG': [without_icg_sum],
            'Total ICG Savings': [total_ICG],
            'WITH Encounter': [with_encounter_sum],
            'Without Encounter': [without_encounter_sum],
            'Total Savings': [total_savings],
            'Total Distance Savings (km)': [total_distance_savings],
            'Total Duration Savings (hours)': [total_duration_savings],
            'Total CO2 Savings (kg)': [total_co2_savings],
            'Total Trips Savings': [total_trips_savings]
        })

        # Combine the main results with the summary row
        final_result_df = pd.concat([result_df, summary_row], ignore_index=True)
        
        print("Cost merging completed. Generating final report...")
        
        # Round all numeric columns to 2 decimal places
        numeric_columns = final_result_df.select_dtypes(include=['float64']).columns
        final_result_df[numeric_columns] = final_result_df[numeric_columns].round(2)
        
        # Save the final combined result
        output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reports")
        os.makedirs(output_dir, exist_ok=True)
        
        # Create a unique filename with timestamp
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        output_filename = f"combined_distances_and_costs_{timestamp}.csv"
        output_path = os.path.join(output_dir, output_filename)
        
        try:
            final_result_df.to_csv(output_path, index=False)
            print(f"Combined CSV report saved to: {output_path}")
            return send_file(output_path, as_attachment=True)
        except PermissionError as e:
            # Try saving to a different location if the first attempt fails
            alt_output_dir = os.path.join(os.path.expanduser("~"), "Downloads")
            alt_output_path = os.path.join(alt_output_dir, output_filename)
            final_result_df.to_csv(alt_output_path, index=False)
            print(f"Combined CSV report saved to alternative location: {alt_output_path}")
            return send_file(alt_output_path, as_attachment=True)

    except Exception as e:
        print(f"Error in calculate_distances_and_merge_costs: {str(e)}")
        import traceback
        print("Full traceback:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500