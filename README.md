# MediCore – Hospital & Healthcare Management System
MCA Major Project · React (frontend) + Flask REST API (backend) + SQLite + scikit-learn + Chart.js

A web application with three roles (Patient, Doctor, Admin), an analytics dashboard built on a
Kaggle-format healthcare dataset, and a machine-learning diabetes-risk predictor trained on the
Kaggle "Pima Indians Diabetes" dataset. The UI is a React single-page app; Flask exposes JSON APIs
and serves the ML predictions.

## 1. Run it (5 minutes)

**Backend (Flask API)**
```bash
python -m venv venv
venv\Scripts\activate            # Windows      (Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
python seed_data.py              # creates instance/hospital.db with demo data + 54,966 dataset rows
python ml/train_model.py         # (optional) retrains the model and regenerates report graphs
python app.py                    # runs the API at http://127.0.0.1:5000
```

**Frontend (React)**
```bash
cd frontend
npm install
npm run dev                      # runs the app at http://127.0.0.1:5173
```
A ready-made database and trained model are already included, so `python app.py` + `npm run dev` alone works.

| Role    | Email                  | Password   |
|---------|------------------------|------------|
| Admin   | admin@hospital.com     | admin123   |
| Doctor  | doctor1@hospital.com … doctor12@hospital.com | doctor123 |
| Patient | patient1@mail.com … patient40@mail.com       | patient123 |

New patients can also register from the login page.

## 2. Datasets (both are the real Kaggle datasets)
* **Hospital admissions (dashboard, reports, forecast)** – `data/healthcare_dataset.csv`: Kaggle *Healthcare Dataset*
  (prasad22/healthcare-dataset), 55,500 rows x 15 columns, 8 May 2019 to 7 May 2024. The importer removes the 534 exact
  duplicate rows (54,966 remain), fixes the random name casing ("Bobby JacksOn" -> "Bobby Jackson") and turns the 108
  negative billing amounts positive. Billing in this dataset is in US dollars, so those charts use `$`; hospital OPD billing uses `₹`.
* **Diabetes (prediction)** – `data/diabetes.csv`: Pima Indians Diabetes Database (768 rows), the same data as Kaggle's
  `uciml/pima-indians-diabetes-database`.
* Note for the viva: Kaggle's own description says the healthcare dataset is *synthetic*, so its trends are fairly flat.
  Say "publicly available Kaggle dataset", not "real patient data".
* To swap in another CSV with the same 15 columns: Admin -> **Hospital dataset** -> **Import a Kaggle CSV**.
  Charts and forecast update immediately.

## 3. Features
**Patient** – register/login, profile, search doctors by name/department, live slot booking (double-booking is blocked),
cancel appointments, medical history and prescriptions, bills with payment and printable receipt, feedback, diabetes risk check.

**Doctor** – daily queue, confirm/cancel appointments, consultation form (diagnosis, vitals, prescription with several medicines),
automatic bill generation and stock deduction, patient history, weekly and diagnosis charts, risk check tool.

**Admin** – dashboard with KPIs and 7 charts, manage patients / doctors / departments / appointments / medicines / billing,
reports (10 charts, CSV export, print), dataset browser with filters and CSV import, model performance page, activity log.

**Prediction and analytics**
1. Diabetes risk – Logistic Regression selected over KNN, Random Forest and Gradient Boosting (5-fold CV ROC-AUC 0.84;
   test accuracy 73%, recall 70%, ROC-AUC 0.81). Missing zeros are median-imputed inside a scikit-learn Pipeline.
2. Admissions forecast – linear trend × monthly seasonality fitted on the dataset, next 3 months shown on the dashboard.

## 4. Tech stack
| Layer | Choice | Why |
|---|---|---|
| Frontend | **React** (Vite), React Router, Chart.js/Recharts | Component-based UI, fast dev server, reusable charts across roles |
| Backend / API | Python 3, Flask (REST, JSON) | Simple, readable, standard for ML projects |
| Database | **SQLite** (`instance/hospital.db`) | Zero setup, file based, full SQL with foreign keys. Schema is portable to MySQL/PostgreSQL |
| ML | pandas, NumPy, scikit-learn, joblib | Data cleaning, model comparison, model saving |
| Graphs | Chart.js (dashboards), Matplotlib (report images) | Interactive in-app, static for the printed report |
| Security | PBKDF2 password hashes, JWT/session auth, role checks, CSRF tokens, parameterised SQL | |

## 5. Folder map
```
app.py                     Flask REST API (auth, admin, doctor, patient, prediction)
database.py / seed_data.py schema and demo data + CSV importer
ml/eda_hospital.py         graphs for the hospital dataset
ml/train_model.py          model training, comparison and graphs
ml/diabetes_model.joblib   trained pipeline      ml/metrics.json  scores
data/                      diabetes.csv, healthcare_dataset.csv
frontend/                  React app (src/pages, src/components — admin/, doctor/, patient/)
report_graphs/             13 PNG graphs (diabetes model + hospital data) for your report and PPT
docs/                      DATABASE.md, VIVA.md, DESIGN.md, schema.sql
tests/smoke_test.py        opens every page and runs booking → consult → bill → payment
```

## 6. Limits to mention honestly
* Diabetes model accuracy is about 73% – normal for this small dataset. It is a screening aid, not a diagnosis.
* Payment is a demo (records a payment; no gateway). Use a real gateway (Razorpay/Stripe) for production.
* SQLite suits a single hospital demo; move to MySQL/PostgreSQL for many concurrent users.
* Change `SECRET_KEY` in `app.py`, the JWT secret, and all demo passwords before any real deployment.
* React frontend and Flask API run as two dev servers locally — in production, build the React app (`npm run build`) and serve it via Flask or a static host, with API calls proxied to the Flask backend.
