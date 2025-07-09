import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import dotenv from 'dotenv';
import fs from 'fs';

// Resolve the project root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../../.env');

// Load environment variables from .env
dotenv.config({ path: envPath });

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://ckcctreqkvwalcqurlcs.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrY2N0cmVxa3Z3YWxjcXVybGNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3OTA5MjMsImV4cCI6MjA2MzM2NjkyM30.H_xLCiqJAYn2qzpEtq0DSWWdj8yDeo7_OIVRCy-WmB0';
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? '[REDACTED]' : 'Not set');
const supabase = createClient(supabaseUrl, supabaseKey);

// Path to your Excel file
const excelFilePath = path.resolve(__dirname, './xlsxxx.xlsx');
console.log('Excel File Path:', excelFilePath);

// Verify the Excel file exists
if (!fs.existsSync(excelFilePath)) {
  console.error(`Error: File not found at ${excelFilePath}`);
  process.exit(1);
}

// Read Excel file and convert to JSON
const workbook = XLSX.readFile(excelFilePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const questionnaireData = XLSX.utils.sheet_to_json(sheet);

// Log Excel headers to verify column mapping
console.log('Excel Column Headers:', Object.keys(questionnaireData[0] || {}));

// Mapping from Excel column headings to database fields
const columnMapping = {
  'Have you confirmed the above disclaimer? ': 'disclaimer_confirmed',
  'A-1-1. 識別番号／ID Number（記述）\n※アンケート依頼メールの中に記載 (as listed in the email)': 'id_number',
  'A-1-2. 氏名（英）／Full Name (English)': 'full_name_english',
  'A-1-3. 氏名（カタカナ）／Full Name (Katakana)': 'full_name_katakana',
  'A-1-4. 性別／Gender（選択）': 'gender',
  'A-1-5. 生年月日／Date of Birth（yyyy/mm/dd）': 'date_of_birth',
  'A-1-6. 現在の居住地／Current Location ※日本に来てから記入(after arriving in Japan)': 'current_location',
  'Enter the name of the place (city, town, or village) you belong to ': 'place_of_belonging',
  'B-1-1. 学歴レベル／Education Level（選択）': 'education_level',
  'B-1-2（B). 学位／Degree（選択）': 'bachelor_degree',
  'B-2-3. 専攻／Major（選択）\n※Fill your Major Branch name(Please don\'t use short forms, type full name)': 'bachelor_major',
  'B-2-4. 大学名／University（選択）': 'bachelor_university',
  'B-2-5.  在籍期間／Years Attended\n※例：2021年8月〜2023年5月(e.g., Aug 2021 – May 2023)': 'bachelor_years_attended',
  'B-2-6.  成績／Academic Score\n※Please enter both the grading system and score (e.g., CGPA: 7.6, Percentage: 92%) ': 'bachelor_academic_score',
  'B-3-1. 学歴レベル／Education Level': 'high_school_education_level',
  'B-3-2. 専攻／Major\n※Fill your Major name(Please don\'t use short forms, type full name)': 'high_school_major',
  'B-3-3. 学校名／School Name': 'high_school_name',
  'B-3-4. 在籍期間／Years Attended ※例：2019年8月〜2023年5月(e.g., Aug 2019 – May 2023)': 'high_school_years_attended',
  'B-3-5. 成績／Academic Score\n※高校の成績は、評価方法とスコアをセットで記入してください（例：CGPA: 7.6、Percentage: 92% など）／Please enter both the grading system and score (e.g., CGPA: 7.6, Percentage: 92%) ': 'high_school_academic_score',
  'C-1-1. 日本語（JLPTレベル）／Japanese (JLPT level) （複数選択可）': 'japanese_jlpt_level',
  'C-1-3. その他言語／Other Languages\n※話せる言語があれば、レベル（日常会話／ビジネス／流暢）とあわせて記載してください。\nIf you speak any other languages, please mention them along with your level (daily conversation, business, fluent).': 'other_languages',
  'D-1-1. プログラミング言語／Programming Languages': 'programming_languages',
  'D-1-2. データベース・クエリ言語／Databases & Querying': 'databases_querying',
  'D-1-3. バージョン管理／Version Control': 'version_control',
  'D-1-4. コードエディタ・IDE／Code Editors & IDEs': 'code_editors_ides',
  'D-1-5. 機械学習フレームワーク／Machine Learning Frameworks': 'ml_frameworks',
  'D-1-6. ロボティクス・ハードウェア／Robotics & Hardware': 'robotics_hardware',
  'D-1-7. オペレーティングシステム／Operating Systems': 'operating_systems',
  'D-1-8. クラウドプラットフォーム／Cloud Platforms': 'cloud_platforms',
  'E-1-1. インターン名（またはテーマ）／Internship Title (or Theme)': 'internship_1_title',
  'E-1-2. 企業名／機関名／Company or Institution Name': 'internship_1_company',
  'E-1-3. 実施期間（年月〜年月）／Period (Month/Year – Month/Year)': 'internship_1_period',
  'E-1-4. チーム規模（例：4人）／Team Size (e.g., 4 people)': 'internship_1_team_size',
  'E-1-5. 使用技術（例：Python, TensorFlow, Arduinoなど）／Technologies Used (e.g., Python, TensorFlow, Arduino)': 'internship_1_technologies',
  'E-1-6. 概要／ Summary ': 'internship_1_summary',
  'E-1-7. 目的・背景（簡潔に）／Purpose / Background (brief)': 'internship_1_purpose',
  'E-1-8. あなたの役割・担当したこと／Your Role or Responsibilities': 'internship_1_role',
  'E-1-9. 工夫・課題と対応方法／Challenges & How You Solved Them': 'internship_1_challenges',
  'E-1-10. 得られた成果や学び／Outcome & Learning': 'internship_1_outcome',
  'E-2-1. インターン名（またはテーマ）／Internship Title (or Theme)': 'internship_2_title',
  'E-2-2. 企業名／機関名／Company or Institution Name': 'internship_2_company',
  'E-2-3. 実施期間（年月〜年月）／Period (Month/Year – Month/Year)': 'internship_2_period',
  'E-2-4. チーム規模（例：4人）／Team Size (e.g., 4 people)': 'internship_2_team_size',
  'E-2-5. 使用技術（例：Python, TensorFlow, Arduinoなど）／Technologies Used (e.g., Python, TensorFlow, Arduino)': 'internship_2_technologies',
  'E-2-6. 概要／ Summary': 'internship_2_summary',
  'E-2-7. 目的・背景（簡潔に）／Purpose / Background (brief)': 'internship_2_purpose',
  'E-2-8. あなたの役割・担当したこと／Your Role or Responsibilities': 'internship_2_role',
  'E-2-9. 工夫・課題と対応方法／Challenges & How You Solved Them': 'internship_2_challenges',
  'E-2-10. 得れた成果や学び／Outcome & Learning': 'internship_2_outcome',
  'F-1-1. プロジェクト名（またはテーマ）／Project Title (or Theme)': 'project_1_title',
  'F-1-2. 実施期間（年月〜年月）／Period (Month/Year – Month/Year)': 'project_1_period',
  'F-1-3. チーム規模（例：4人）／Team Size (e.g., 4 people)': 'project_1_team_size',
  'F-1-4. 使用技術（例：Python, TensorFlow, Arduinoなど）／Technologies Used (e.g., Python, TensorFlow, Arduino)': 'project_1_technologies',
  'F-1-5. 概要／ Summary': 'project_1_summary',
  'F-1-6. 目的・背景（簡潔に）／Purpose / Background (brief)': 'project_1_purpose',
  'F-1-7. あなたの役割・担当したこと／Your Role or Responsibilities': 'project_1_role',
  'F-1-8.  工夫・課題と対応方法／ ／Challenges & How You Solved Them': 'project_1_challenges',
  'F-1-9. 得られた成果や学び／Outcome & Learning': 'project_1_outcome',
  'F-2-1. プロジェクト名（またはテーマ）／Project Title (or Theme)': 'project_2_title',
  'F-2-2. 実施期間（年月〜年月）／Period (Month/Year – Month/Year)': 'project_2_period',
  'F-2-3. チーム規模（例：4人）／Team Size (e.g., 4 people)': 'project_2_team_size',
  'F-2-4. 使用技術（例：Python, TensorFlow, Arduinoなど）／Technologies Used (e.g., Python, TensorFlow, Arduino)': 'project_2_technologies',
  'F-2-5. 概要／ Summary': 'project_2_summary',
  'F-2-6. 目的・背景（簡潔に）／Purpose / Background (brief)': 'project_2_purpose',
  'F-2-7. あなたの役割・担当したこと／Your Role or Responsibilities': 'project_2_role',
  'F-2-8.  工夫・課題と対応方法／Challenges & How You Solved Them': 'project_2_challenges',
  'F-2-9. 得られた成果や学び／Outcome & Learning': 'project_2_outcome',
  'G-1-1A. 興味ある職種／Interested Job Roles\n第一希望／Choose Your First Periority': 'job_role_priority_1',
  'G-1-1B. 興味ある職種／Interested Job Roles\n第二希望／Choose Your Second Periority': 'job_role_priority_2',
  'G-1-1C.  興味ある職種／Interested Job Roles \n第三希望／Choose Your Third Periority': 'job_role_priority_3',
  'G-1-1D.  興味ある職種／Interested Job Roles \n第四希望／Choose Your Fourth Periority': 'job_role_priority_4',
  'G-1-1E.  興味ある職種／Interested Job Roles \n第五希望／Choose Your Fifth Periority': 'job_role_priority_5',
  'G-1-2. 希望業界／Preferred Industry（複数選択可）': 'preferred_industry',
  'G-1-3. 働き方の志向／Work Style Preference（複数選択可）': 'work_style_preference',
  'G-1-4. 将来的に目指したい役割／\nFuture Career Goals / Desired Roles (Multiple Selection Possible) ': 'future_career_goals',
  'G-1-5. 働く上での価値観／Work Values ': 'work_values',
  'H-1-1. 学生団体／プロジェクトリーダー／イベント運営等／Student Groups / Project Leadership / Event Management': 'student_groups_leadership',
  'H-1-2. 発表受賞チームマネジメント経験など／Presentations, Awards, Team Management（任意）': 'awards_team_management',
  'I-1-1. 日本企業に興味を持った理由／Why are you interested in working for a Japanese company?': 'interest_in_japanese_companies',
  'I-1-2. 学びたい点（品質技術文化など）／What aspects do you want to learn? (Quality, Technology, Culture, etc.)': 'aspects_to_learn',
  '\nI-1-3日本企業でやってみたい仕事／Jobs You Want to Try at a Japanese Company ': 'jobs_to_try_in_japan',
  '\nJ-1-1. 備考／補足（特記事項や伝えたいこと）／Additional Notes or Comments': 'additional_notes',
  '\nJ-1-2. GitHub・ポートフォリオリンク／GitHub / Portfolio Link (if any)（ある場合） ': 'github_portfolio_link',
  'J-1-3. 趣味、興味あること／What are your hobbies or interests?': 'hobbies_interests'
};

// Fields that should be arrays in Supabase
const arrayFields = [
  'japanese_jlpt_level',
  'programming_languages',
  'databases_querying',
  'version_control',
  'code_editors_ides',
  'ml_frameworks',
  'robotics_hardware',
  'operating_systems',
  'cloud_platforms',
  'preferred_industry',
  'work_style_preference',
  'future_career_goals',
  'work_values',
  'aspects_to_learn'
];

// Required fields that cannot be null
const requiredFields = [
  'id_number',
  'disclaimer_confirmed',
  'full_name_english',
  'full_name_katakana'
];

// Counter for generating unique id_number
let idCounter = 1;

// Function to generate unique id_number
function generateIdNumber() {
  return `AUTO_${String(idCounter++).padStart(3, '0')}`;
}

// Function to convert Excel serial date to JavaScript Date
function excelSerialToDate(serial) {
  const excelEpoch = new Date(1899, 11, 30); // Excel's epoch (Dec 30, 1899)
  const msPerDay = 24 * 60 * 60 * 1000;
  return new Date(excelEpoch.getTime() + serial * msPerDay);
}

// Function to transform a single record
function transformRecord(record) {
  const transformed = {};
  for (const [excelKey, dbKey] of Object.entries(columnMapping)) {
    let value = record[excelKey] || null;
    if (value && arrayFields.includes(dbKey)) {
      // Convert comma-separated string to array
      value = String(value).split(',').map(item => item.trim()).filter(item => item);
    } else if (dbKey.includes('team_size') && value) {
      // Convert team size to integer
      value = parseInt(String(value), 10);
      if (isNaN(value)) value = null;
    } else if (dbKey === 'date_of_birth' && value) {
      // Standardize date to YYYY-MM-DD
      if (!isNaN(value) && Number(value) > 10000) {
        // Handle Excel serial date
        const date = excelSerialToDate(Number(value));
        value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      } else {
        value = String(value).split('/').join('-');
        // Validate date format (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || isNaN(new Date(value).getTime())) value = null;
      }
    } else if (dbKey === 'disclaimer_confirmed' && (value === null || value === '')) {
      // Default to "Yes" (TEXT)
      value = 'Yes';
      console.log(`Set default disclaimer_confirmed: Yes for ${record['A-1-2. 氏名（英）／Full Name (English)'] || 'unknown'}`);
    } else if (dbKey === 'id_number' && (value === null || value === '')) {
      // Generate unique id_number
      value = generateIdNumber();
      console.log(`Generated id_number: ${value} for ${record['A-1-2. 氏名（英）／Full Name (English)'] || 'unknown'}`);
    } else if (dbKey.startsWith('job_role_priority') && value) {
      // Ensure job role priorities are trimmed and not null
      value = String(value).trim();
      if (value === '') value = null;
      console.log(`Processing ${dbKey}: ${value} for ${record['A-1-2. 氏名（英）／Full Name (English)'] || 'unknown'}`);
    }
    transformed[dbKey] = value;
  }
  // Validate required fields
  for (const field of requiredFields) {
    if (transformed[field] === null || transformed[field] === '') {
      throw new Error(`Missing required field: ${field} for record with ID ${transformed.id_number || 'unknown'}`);
    }
  }
  return transformed;
}

// Function to upload data to Supabase
async function uploadData() {
  try {
    // Log first few records for debugging, focusing on job_role_priority
    console.log('Sample Excel Data (first 2 records):', questionnaireData.slice(0, 2).map(record => ({
      full_name_english: record['A-1-2. 氏名（英）／Full Name (English)'],
      job_role_priority_1: record['G-1-1A. 興味ある職種／Interested Job Roles\n第一希望／Choose Your First Periority'],
      job_role_priority_2: record['G-1-1B. 興味ある職種／Interested Job Roles\n第二希望／Choose Your Second Periority'],
      job_role_priority_3: record['G-1-1C.  興味ある職種／Interested Job Roles \n第三希望／Choose Your Third Periority'],
      job_role_priority_4: record['G-1-1D.  興味ある職種／Interested Job Roles \n第四希望／Choose Your Fourth Periority'],
      job_role_priority_5: record['G-1-1E.  興味ある職種／Interested Job Roles \n第五希望／Choose Your Fifth Periority']
    })));
    const batchSize = 100; // Batch inserts to avoid rate limits
    for (let i = 0; i < questionnaireData.length; i += batchSize) {
      const batch = questionnaireData.slice(i, i + batchSize).map(record => {
        try {
          return transformRecord(record);
        } catch (err) {
          console.error(`Skipping record due to error: ${err.message}`);
          console.error('Problematic record:', {
            id_number: record['A-1-1. 識別番号／ID Number（記述）\n※アンケート依頼メールの中に記載 (as listed in the email)'],
            disclaimer_confirmed: record['Have you confirmed the above disclaimer? '],
            full_name_english: record['A-1-2. 氏名（英）／Full Name (English)'],
            full_name_katakana: record['A-1-3. 氏名（カタカナ）／Full Name (Katakana)']
          });
          return null; // Skip invalid record
        }
      }).filter(record => record !== null); // Remove invalid records
      if (batch.length === 0) {
        console.log(`Batch ${i / batchSize + 1} is empty, skipping.`);
        continue;
      }
      const { data, error } = await supabase
        .from('data')
        .insert(batch)
        .select('id_number'); // Return id_number for logging

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        console.error('Problematic batch records:', batch.map(r => ({
          id_number: r.id_number,
          disclaimer_confirmed: r.disclaimer_confirmed,
          full_name_english: r.full_name_english,
          full_name_katakana: r.full_name_katakana,
          job_role_priority_1: r.job_role_priority_1
        })));
        continue;
      }
      console.log(`Successfully inserted batch ${i / batchSize + 1} with IDs:`, data.map(d => d.id_number));
    }
    console.log('Data upload completed.');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the upload
uploadData();