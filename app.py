
import streamlit as st 
import pickle 
import os
import sklearn.ensemble._gb
import sys
from types import ModuleType

# Patch for old scikit-learn models using _gb_losses
# Patch for old scikit-learn models using _gb_losses
# Define LogitLink for compatibility - Global scope to be available for patch_sklearn_model
class LogitLink:
    def link(self, prediction):
        return np.log(prediction / (1 - prediction))
    def inverse(self, prediction):
        return 1 / (1 + np.exp(-prediction))

# Patch for old scikit-learn models using _gb_losses
if True: # Always overwrite to ensure updates
    gb_losses = ModuleType("sklearn.ensemble._gb_losses")
    
    class BinomialDeviance(sklearn.ensemble._gb.HalfBinomialLoss): 
        @property
        def link(self):
            return LogitLink()
            
    class ExponentialLoss(sklearn.ensemble._gb.ExponentialLoss):
        @property
        def link(self):
            return LogitLink()

    gb_losses.BinomialDeviance = BinomialDeviance
    gb_losses.ExponentialLoss = ExponentialLoss
    sys.modules['sklearn.ensemble._gb_losses'] = gb_losses

# Helper to patch models for newer sklearn versions
def patch_sklearn_model(model):
    """
    Recursively patch models to fix 'monotonic_cst' attribute error 
    when loading older sklearn models in newer versions.
    """
    try:
        # For GradientBoostingClassifier/Regressor (estimators_ is 2D array)
        if hasattr(model, 'estimators_'):
            for est_row in model.estimators_:
                # estimators_ can be 1D or 2D depending on model type
                if isinstance(est_row, (list, np.ndarray)):
                    for est in est_row:
                        if not hasattr(est, 'monotonic_cst'):
                            est.monotonic_cst = None
                else:
                    # random forest or similar where estimators_ is 1D
                    if not hasattr(est_row, 'monotonic_cst'):
                        est_row.monotonic_cst = None
                        
        # For base estimator if accessible
        if hasattr(model, 'estimator'):
            if not hasattr(model.estimator, 'monotonic_cst'):
                model.estimator.monotonic_cst = None
        
        # Patch loss_ for GradientBoostingClassifier (which these likely are)
        # Attempt to fix 'ExponentialLoss object has no attribute link'
        if hasattr(model, 'loss_'):
             if not hasattr(model.loss_, 'link'):
                 model.loss_.link = LogitLink()

    except Exception as e:
        pass # Best effort patch

from streamlit_option_menu import option_menu
from streamlit_option_menu import option_menu
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel('gemini-flash-latest')
except:
    pass # handle case if key not set


# Set page config at the very beginning
st.set_page_config(page_title="MediQ", layout="wide", page_icon="🩺")

# Inject Custom CSS
def local_css(file_name):
    with open(file_name) as f:
        st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)

local_css("style.css")

working_dir = os.path.dirname(os.path.abspath(__file__))

import numpy as np 

# Load Models
diabetes_model = pickle.load(open(f'{working_dir}/saved_models/diabetes.pkl','rb'))
patch_sklearn_model(diabetes_model)

heart_disease_model = pickle.load(open(f'{working_dir}/saved_models/heart.pkl','rb'))
patch_sklearn_model(heart_disease_model)

kidney_disease_model = pickle.load(open(f'{working_dir}/saved_models/kidney.pkl','rb'))
patch_sklearn_model(kidney_disease_model)

# Session State Initialization
if 'diabetes_input' not in st.session_state: st.session_state['diabetes_input'] = {}
if 'heart_input' not in st.session_state: st.session_state['heart_input'] = {}
if 'kidney_input' not in st.session_state: st.session_state['kidney_input'] = {}

# --- Top Navigation Bar ---
# Custom HTML Header
st.markdown("""
<div class="nav-container">
    <div class="nav-logo">
        <span>🩺</span> MediQ
    </div>
    <!-- Navigation happens via option_menu below -->
</div>
""", unsafe_allow_html=True)

selected = option_menu(
    menu_title=None,
    options=['Home', 'Diabetes', 'Heart', 'Kidney', 'AI Assistant'],
    icons=['', 'activity', 'heart', 'droplet', 'robot'],
    default_index=0,
    orientation="horizontal",
    styles={
        "container": {"padding": "0!important", "background-color": "#ffffff"},
        "icon": {"color": "#666", "font-size": "14px"}, 
        "nav-link": {"font-size": "14px", "text-align": "center", "margin": "0px", "--hover-color": "#eee"},
        "nav-link-selected": {"background-color": "#1E3A2F", "color": "white", "font-weight": "600"},
    }
)

# --- HOME / AI ASSISTANT PAGE ---
if selected == 'Home':
    st.markdown('<div style="text-align: center; padding: 2rem 0;">', unsafe_allow_html=True)
    st.markdown('<div class="slogan-pill"></div>', unsafe_allow_html=True)
    st.markdown('<div class="hero-icon">💬</div>', unsafe_allow_html=True)
    st.markdown('<h1>AI Health Assistant</h1>', unsafe_allow_html=True)
    st.markdown('<p class="subtitle">Ask me anything about health, diseases, and medical advice</p>', unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

    # Central Chat Interface
    if "messages" not in st.session_state:
        st.session_state.messages = []

    # Display chat history centered (max-width container ideally, but using std layout)
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.markdown(message["content"])

        if prompt := st.chat_input("Ask a health question..."):
            st.session_state.messages.append({"role": "user", "content": prompt})
            with st.chat_message("user"):
                st.markdown(prompt)

            with st.chat_message("assistant"):
                message_placeholder = st.empty()
                full_response = ""
                try:
                    system_prompt = "You are a helpful medical assistant..."
                    # ... [Gemini Logic same as before] ...
                    # Re-implementing simplified Gemini call for brevity in this replace block
                    history = []
                    for m in st.session_state.messages[:-1]:
                        role = "user" if m["role"] == "user" else "model"
                        history.append({"role": role, "parts": [m["content"]]})
                    
                    chat = model.start_chat(history=history)
                    user_message = f"{system_prompt}\n\nUser Query: {prompt}"
                    response = chat.send_message(user_message, stream=True)
                    
                    for chunk in response:
                        if chunk.text:
                            full_response += chunk.text
                            message_placeholder.markdown(full_response + "▌")
                    message_placeholder.markdown(full_response)
                    st.session_state.messages.append({"role": "assistant", "content": full_response})
                except Exception as e:
                    st.error(f"Error: {str(e)}")


# --- DIABETES PAGE ---
if selected == 'Diabetes':
    st.markdown("<h1>Diabetes Prediction</h1>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; margin-bottom: 2rem;'>Enter patient details below to predict diabetes risk.</p>", unsafe_allow_html=True)

    col1, col2, col3 = st.columns(3)
    with col1:
        Pregnancies = st.text_input("Number of Pregnancies")
    with col2:
        Glucose = st.text_input("Glucose Level")
    with col3:
        BloodPressure = st.text_input("Blood Pressure")
    with col1:
        SkinThickness = st.text_input("Skin Thickness")
    with col2:
        Insulin = st.text_input("Insulin Level")
    with col3:
        BMI = st.text_input("BMI Value")
    with col1:
        DiabetesPedigreeFunction = st.text_input("Diabetes Pedigree Function")
    with col2:
        Age = st.text_input("Age")
    
    diabetes_result = ""
    
    # Button to trigger prediction
    if st.button("Diabetes Test Result"):
        # Logic for calculation (BMI, Insulin, Glucose groups) - keeping existing logic
        if BMI and float(BMI)<=18.5:
            NewBMI_Underweight = 1
        elif BMI and 18.5 < float(BMI) <=24.9:
            pass
        elif BMI and 24.9<float(BMI)<=29.9:
            NewBMI_Overweight =1
        elif BMI and 29.9<float(BMI)<=34.9:
            NewBMI_Obesity_1 =1
        elif BMI and 34.9<float(BMI)<=39.9:
            NewBMI_Obesity_2=1
        elif BMI and float(BMI)>39.9:
            NewBMI_Obesity_3 = 1
        
        if Insulin and 16<=float(Insulin)<=166:
            NewInsulinScore_Normal = 1

        if Glucose and float(Glucose)<=70:
            NewGlucose_Low = 1
        elif Glucose and 70<float(Glucose)<=99:
            NewGlucose_Normal = 1
        elif Glucose and 99<float(Glucose)<=126:
            NewGlucose_Overweight = 1
        elif Glucose and float(Glucose)>126:
            NewGlucose_Secret = 1

        user_input=[Pregnancies,Glucose,BloodPressure,SkinThickness,Insulin,
                    BMI,DiabetesPedigreeFunction,Age, NewBMI_Underweight,
                    NewBMI_Overweight,NewBMI_Obesity_1,
                    NewBMI_Obesity_2,NewBMI_Obesity_3,NewInsulinScore_Normal, 
                    NewGlucose_Low,NewGlucose_Normal, NewGlucose_Overweight,
                    NewGlucose_Secret]
        
        try:
            user_input = [float(x) for x in user_input]
            prediction = diabetes_model.predict([user_input])
            probability = diabetes_model.predict_proba([user_input])[0][1] # Probability of class 1 (Positive)
            
            if prediction[0]==1:
                diabetes_result = f"The person has diabetic (Probability: {probability:.2%})"
                result_class = "negative"
            else:
                diabetes_result = f"The person has no diabetic (Probability: {1-probability:.2%})"
                result_class = "positive"
                
            # Store result in session state
            st.session_state['diabetes_result'] = diabetes_result
            st.session_state['diabetes_probability'] = probability
            st.session_state['diabetes_input'] = {
                "Pregnancies": Pregnancies, "Glucose": Glucose, "BloodPressure": BloodPressure,
                "SkinThickness": SkinThickness, "Insulin": Insulin, "BMI": BMI,
                "DiabetesPedigreeFunction": DiabetesPedigreeFunction, "Age": Age
            }
            
        except ValueError:
            st.error("Please enter valid numerical values for all fields.")

    # Display Result if it exists
    if 'diabetes_result' in st.session_state and st.session_state['diabetes_result']:
        res = st.session_state['diabetes_result']
        prob = st.session_state.get('diabetes_probability', 0)
        is_positive = "has diabetic" in res
        
        border_color = "#F44336" if is_positive else "#4CAF50"
        bg_color = "#ffebee" if is_positive else "#f0f2f6"
        
        st.markdown(f"""
        <div class="prediction-card" style="border-left: 5px solid {border_color}; background-color: {bg_color};">
            <div class="prediction-title">Prediction Result</div>
            <div class="prediction-text">{res}</div>
        </div>
        """, unsafe_allow_html=True)
        
        # specific probability visual
        st.write("Prediction Confidence:")
        st.progress(prob if is_positive else 1-prob)
        
        col_buttons1, col_buttons2 = st.columns(2)
        
        # Feature: AI Health Tips
        with col_buttons1:
            if st.button("Get AI Health Tips 💡"):
                with st.spinner("Generating personalized health tips..."):
                    try:
                        input_summary = ", ".join([f"{k}: {v}" for k, v in st.session_state['diabetes_input'].items()])
                        prompt = f"The user has been diagnosed with: {res}. Here is their data: {input_summary}. Provide 3-5 short, actionable health tips for them. Keep it encouraging."
                        response = model.generate_content(prompt)
                        st.info(response.text)
                    except Exception as e:
                        st.error(f"Could not fetch tips: {str(e)}")

        # Feature: Download Report
        with col_buttons2:
            report_text = f"Diabetes Prediction Report\n\nResult: {res}\n\nPatient Data:\n"
            for k, v in st.session_state['diabetes_input'].items():
                report_text += f"- {k}: {v}\n"
            
            st.download_button(
                label="Download Report 📄",
                data=report_text,
                file_name="diabetes_report.txt",
                mime="text/plain"
            )

if selected == 'Heart':
    st.markdown("<h1>Heart Disease Prediction</h1>", unsafe_allow_html=True)
    col1, col2, col3  = st.columns(3)

    with col1:
        age = st.text_input("Age")
    with col2:
        sex = st.text_input("Sex")
    with col3:
        cp = st.text_input("Chest Pain Types")
    with col1:
        trestbps = st.text_input("Resting Blood Pressure")
    with col2:
        chol = st.text_input("Serum Cholestroal in mg/dl")
    with col3:
        fbs = st.text_input('Fasting Blood Sugar > 120 mg/dl')
    with col1:
        restecg = st.text_input('Resting Electrocardiographic results')

    with col2:
        thalach = st.text_input('Maximum Heart Rate achieved')

    with col3:
        exang = st.text_input('Exercise Induced Angina')

    with col1:
        oldpeak = st.text_input('ST depression induced by exercise')

    with col2:
        slope = st.text_input('Slope of the peak exercise ST segment')

    with col3:
        ca = st.text_input('Major vessels colored by flourosopy')

    with col1:
        thal = st.text_input('thal: 0 = normal; 1 = fixed defect; 2 = reversable defect')
        
    heart_disease_result = ""
    
    if st.button("Heart Disease Test Result"):
        try:
            user_input = [age,sex,cp,trestbps,chol,fbs,restecg,thalach,exang,oldpeak,slope,ca,thal]
            user_input = [float(x) for x in user_input]
            prediction = heart_disease_model.predict([user_input])
            probability = heart_disease_model.predict_proba([user_input])[0][1]
            
            if prediction[0]==1:
                heart_disease_result = f"This person is having heart disease (Probability: {probability:.2%})"
            else:
                heart_disease_result = f"This person does not have any heart disease (Probability: {1-probability:.2%})"
                
            st.session_state['heart_result'] = heart_disease_result
            st.session_state['heart_probability'] = probability
            st.session_state['heart_input'] = {
                "Age": age, "Sex": sex, "Chest Pain": cp, "Resting BP": trestbps,
                "Cholesterol": chol, "Fasting BS": fbs, "Resting ECG": restecg,
                "Max Heart Rate": thalach, "Exercise Angina": exang, "Oldpeak": oldpeak,
                "Slope": slope, "Major Vessels": ca, "Thal": thal
            }
        except ValueError:
            st.error("Please enter valid numerical values for all fields.")
            
    if 'heart_result' in st.session_state and st.session_state['heart_result']:
        res = st.session_state['heart_result']
        prob = st.session_state.get('heart_probability', 0)
        is_positive = "having heart disease" in res
        
        border_color = "#F44336" if is_positive else "#4CAF50"
        bg_color = "#ffebee" if is_positive else "#f0f2f6"
        
        st.markdown(f"""
        <div class="prediction-card" style="border-left: 5px solid {border_color}; background-color: {bg_color};">
            <div class="prediction-title">Prediction Result</div>
            <div class="prediction-text">{res}</div>
        </div>
        """, unsafe_allow_html=True)
        
        st.write("Prediction Confidence:")
        st.progress(prob if is_positive else 1-prob)
        
        col_buttons1, col_buttons2 = st.columns(2)
        
        with col_buttons1:
            if st.button("Get AI Health Tips 💡", key="heart_tips"):
                with st.spinner("Generating personalized heart health tips..."):
                    try:
                        input_summary = ", ".join([f"{k}: {v}" for k, v in st.session_state['heart_input'].items()])
                        prompt = f"The user has been diagnosed with: {res}. Here is their data: {input_summary}. Provide 3-5 short, actionable heart health tips for them. Keep it encouraging."
                        response = model.generate_content(prompt)
                        st.info(response.text)
                    except Exception as e:
                        st.error(f"Could not fetch tips: {str(e)}")

        with col_buttons2:
            report_text = f"Heart Disease Prediction Report\n\nResult: {res}\n\nPatient Data:\n"
            for k, v in st.session_state['heart_input'].items():
                report_text += f"- {k}: {v}\n"
            
            st.download_button(
                label="Download Report 📄",
                data=report_text,
                file_name="heart_disease_report.txt",
                mime="text/plain",
                key="heart_download"
            )

if selected == 'Kidney':
    st.markdown("<h1>Kidney Disease Prediction</h1>", unsafe_allow_html=True)

    col1, col2, col3, col4, col5 = st.columns(5)

    with col1:
        age = st.text_input('Age')

    with col2:
        blood_pressure = st.text_input('Blood Pressure')

    with col3:
        specific_gravity = st.text_input('Specific Gravity')

    with col4:
        albumin = st.text_input('Albumin')

    with col5:
        sugar = st.text_input('Sugar')

    with col1:
        red_blood_cells = st.text_input('Red Blood Cell')

    with col2:
        pus_cell = st.text_input('Pus Cell')

    with col3:
        pus_cell_clumps = st.text_input('Pus Cell Clumps')

    with col4:
        bacteria = st.text_input('Bacteria')

    with col5:
        blood_glucose_random = st.text_input('Blood Glucose Random')

    with col1:
        blood_urea = st.text_input('Blood Urea')

    with col2:
        serum_creatinine = st.text_input('Serum Creatinine')

    with col3:
        sodium = st.text_input('Sodium')

    with col4:
        potassium = st.text_input('Potassium')

    with col5:
        haemoglobin = st.text_input('Haemoglobin')

    with col1:
        packed_cell_volume = st.text_input('Packet Cell Volume')

    with col2:
        white_blood_cell_count = st.text_input('White Blood Cell Count')

    with col3:
        red_blood_cell_count = st.text_input('Red Blood Cell Count')

    with col4:
        hypertension = st.text_input('Hypertension')

    with col5:
        diabetes_mellitus = st.text_input('Diabetes Mellitus')

    with col1:
        coronary_artery_disease = st.text_input('Coronary Artery Disease')

    with col2:
        appetite = st.text_input('Appetitte')

    with col3:
        peda_edema = st.text_input('Peda Edema')
    with col4:
        aanemia = st.text_input('Aanemia')

    # code for Prediction
    kindey_diagnosis = ''

    # creating a button for Prediction    
    if st.button("Kidney Disease Test Result"):
        try:
            user_input = [age, blood_pressure, specific_gravity, albumin, sugar,
            red_blood_cells, pus_cell, pus_cell_clumps, bacteria,
            blood_glucose_random, blood_urea, serum_creatinine, sodium,
            potassium, haemoglobin, packed_cell_volume,
            white_blood_cell_count, red_blood_cell_count, hypertension,
            diabetes_mellitus, coronary_artery_disease, appetite,
            peda_edema, aanemia]

            user_input = [float(x) for x in user_input]
            prediction = kidney_disease_model.predict([user_input])
            probability = kidney_disease_model.predict_proba([user_input])[0][1]

            if prediction[0] == 1:
                kindey_diagnosis = f"The person has Kidney's disease (Probability: {probability:.2%})"
            else:
                kindey_diagnosis = f"The person does not have Kidney's disease (Probability: {1-probability:.2%})"
            
            st.session_state['kidney_result'] = kindey_diagnosis
            st.session_state['kidney_probability'] = probability
            st.session_state['kidney_input'] = {
                "Age": age, "BP": blood_pressure, "Specific Gravity": specific_gravity, "Albumin": albumin,
                "Sugar": sugar, "RBC": red_blood_cells, "Pus Cell": pus_cell, "Pus Cell Clumps": pus_cell_clumps,
                "Bacteria": bacteria, "BGR": blood_glucose_random, "Blood Urea": blood_urea, "Serum Creatinine": serum_creatinine,
                "Sodium": sodium, "Potassium": potassium, "Hemoglobin": haemoglobin, "PCV": packed_cell_volume,
                "WBC": white_blood_cell_count, "RBC Count": red_blood_cell_count, "Hypertension": hypertension,
                "DM": diabetes_mellitus, "CAD": coronary_artery_disease, "Appetite": appetite,
                "PE": peda_edema, "Anemia": aanemia
            }
        except ValueError:
            st.error("Please enter valid numerical values for all fields.")

    if 'kidney_result' in st.session_state and st.session_state['kidney_result']:
        res = st.session_state['kidney_result']
        prob = st.session_state.get('kidney_probability', 0)
        is_positive = "has Kidney's disease" in res
        
        border_color = "#F44336" if is_positive else "#4CAF50"
        bg_color = "#ffebee" if is_positive else "#f0f2f6"
        
        st.markdown(f"""
        <div class="prediction-card" style="border-left: 5px solid {border_color}; background-color: {bg_color};">
            <div class="prediction-title">Prediction Result</div>
            <div class="prediction-text">{res}</div>
        </div>
        """, unsafe_allow_html=True)
        
        st.write("Prediction Confidence:")
        st.progress(prob if is_positive else 1-prob)
        
        col_buttons1, col_buttons2 = st.columns(2)
        
        with col_buttons1:
            if st.button("Get AI Health Tips 💡", key="kidney_tips"):
                with st.spinner("Generating personalized kidney health tips..."):
                    try:
                        input_summary = ", ".join([f"{k}: {v}" for k, v in st.session_state['kidney_input'].items()])
                        prompt = f"The user has been diagnosed with: {res}. Here is their data: {input_summary}. Provide 3-5 short, actionable kidney health tips for them. Keep it encouraging."
                        response = model.generate_content(prompt)
                        st.info(response.text)
                    except Exception as e:
                        st.error(f"Could not fetch tips: {str(e)}")

        with col_buttons2:
            report_text = f"Kidney Disease Prediction Report\n\nResult: {res}\n\nPatient Data:\n"
            for k, v in st.session_state['kidney_input'].items():
                report_text += f"- {k}: {v}\n"
            
            st.download_button(
                label="Download Report 📄",
                data=report_text,
                file_name="kidney_disease_report.txt",
                mime="text/plain",
                key="kidney_download"
            )

if selected == 'AI Assistant':
    st.markdown("<h1>AI Health Assistant 🤖</h1>", unsafe_allow_html=True)
    st.info("I am a specialized health assistant. I can only answer questions related to medicine, health, and diseases.")

    if "messages" not in st.session_state:
        st.session_state.messages = []

    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    if prompt := st.chat_input("Ask a health-related question..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):
            message_placeholder = st.empty()
            full_response = ""
            
            try:
                # Construct prompt with system instruction
                system_prompt = "You are a helpful medical assistant. You only answer questions related to medicine, health, diseases, and medical advice. If a user asks about anything else, politely refuse and remind them that you can only help with health-related queries."
                
                # Gemini doesn't use "system" role in the same way for chat context in simple API
                # We prepend system prompt to the history or strictly enforce it in the message structure
                # For simplicity with gemini-pro, we can prepend it to the latest message or use a chat session
                
                # Build history for Gemini
                history = []
                for m in st.session_state.messages[:-1]: # All except last user message
                    role = "user" if m["role"] == "user" else "model"
                    history.append({"role": role, "parts": [m["content"]]})
                
                chat = model.start_chat(history=history)
                
                # Send message with system instruction prepended to the latest user prompt for context 
                # or just rely on the model instructions if supported. 
                # For strictness, let's prepend to the user query.
                user_message = f"{system_prompt}\n\nUser Query: {prompt}"
                
                response = chat.send_message(user_message, stream=True)
                
                for chunk in response:
                    if chunk.text:
                        full_response += chunk.text
                        message_placeholder.markdown(full_response + "▌")
                message_placeholder.markdown(full_response)
                
                st.session_state.messages.append({"role": "assistant", "content": full_response})
                
            except Exception as e:
                st.error(f"An error occurred: {str(e)}")

