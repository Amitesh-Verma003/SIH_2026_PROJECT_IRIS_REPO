IRIS — AI-Powered Diabetic Retinopathy Screening Pipeline

IRIS is a MATLAB-based, explainable retinal image analysis pipeline for automated diabetic retinopathy (DR) screening in low-resource, rural healthcare settings. India has 77M+ diabetic adults and only ~1 ophthalmologist per 100,000 rural population, making manual screening infeasible at scale — IRIS addresses this by combining image quality assessment and enhancement, retinal structure and lesion segmentation (optic disc, fovea, vessels, microaneurysms, exudates, hemorrhages, neovascularization), ICDR 0–4 severity grading, and Grad-CAM–based explainability into a single validated pipeline, backed by a Simulink model for district-level screening resource allocation. The system targets >90% sensitivity and >85% specificity for referable DR, with human-in-the-loop review in under 30 seconds, and is validated against expert-adjudicated ground truth and published benchmarks (APTOS, IDRiD, Messidor-2, EyePACS).

1. Important First Step: Apply Your Stashed Changes
Since you just created and switched to the new branch ps_specific_modifications, your working tree is clean because your changes are currently saved in your stash.

To bring the MATLAB files, preprocessor, segmentor, and benchmark suite into ps_specific_modifications, run:

bash
git stash pop




2. Backend Run Command (FastAPI)
The error No module named app.main:app occurred because FastAPI apps are served using uvicorn rather than running the module directly with Python.

Navigate into iris_backend and run:

bash
cd iris_backend
python -m uvicorn app.main:app --reload --port 8000
(Or simply uvicorn app.main:app --reload if uvicorn is in your system PATH)

API Server: http://127.0.0.1:8000
Interactive Swagger Docs: http://127.0.0.1:8000/docs




3. Frontend Run Command (React / Vite)
Open a second terminal window, navigate into iris_frontend, and run:

bash
cd iris_frontend
npm run dev
Web Portal: http://localhost:5173




4. Benchmark & Model Verification Commands
From the project root (SIH_2026_PROJECT_IRIS_REPO):

Run the Clinical Benchmark & Ablation Study:

bash
python evaluate_benchmarks.py
(Verifies $>90%$ Sensitivity, $>85%$ Specificity, and outputs ROC curve images)

Test Full End-to-End Inference (IQA + CLAHE + Segmentation + Grad-CAM):

bash
python iris_backend/test_model_inference.py



5. MATLAB Master Pipeline (In MATLAB Desktop / Online)
In the MATLAB command prompt:

matlab
cd matlab
run_iris_pipeline


