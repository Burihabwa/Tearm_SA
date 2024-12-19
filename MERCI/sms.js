models:
  AcademicYear:
    year: string unique
    start_date: date
    end_date: date
    status: string default:'active'
    current: boolean default:false
    relationships:
      hasMany: CourseEnrollment, Course, Payment, Report
    softDeletes: true
    timestamps: true

  User:
    first_name: string
    last_name: string
    email: string unique
    password: string
    phone: string
    address: text
    city: string
    country: string
    gender: string
    birth_date: date
    photo: string nullable
    status: string default:'active'
    last_login_at: timestamp nullable
    remember_token: string nullable
    email_verified_at: timestamp nullable
    relationships:
      belongsToMany: Role
    softDeletes: true
    timestamps: true

  Role:
    name: string
    description: string nullable
    relationships:
      belongsToMany: User, Permission
    softDeletes: true
    timestamps: true

  Permission:
    name: string
    slug: string unique
    description: text nullable
    relationships:
      belongsToMany: Role
    softDeletes: true
    timestamps: true

  Student:
    matricule: string unique
    first_name: string
    last_name: string
    email: string unique nullable
    phone: string nullable
    address: text
    gender: string
    birth_date: date
    birth_place: string
    nationality: string
    photo: string nullable
    admission_date: date
    current_class: string
    academic_year_id: id foreign
    education_level: string
    previous_school: string nullable
    guardian_name: string
    guardian_relationship: string
    guardian_phone: string
    guardian_email: string nullable
    guardian_address: text
    guardian_occupation: string
    health_issues: text nullable
    blood_group: string nullable
    emergency_contact: string
    status: string default:'active'
    additional_info: json nullable
    relationships:
      belongsTo: AcademicYear
      hasMany: CourseEnrollment, Payment, Grade, Attendance
      belongsToMany: Activity
    softDeletes: true
    timestamps: true

  Teacher:
    employee_id: string unique
    first_name: string
    last_name: string
    email: string unique
    phone: string
    address: text
    gender: string
    birth_date: date
    nationality: string
    photo: string nullable
    joining_date: date
    contract_type: string
    employment_status: string default:'active'
    qualification: string
    specialization: string
    experience_years: integer
    previous_employment: text nullable
    department_id: id foreign
    position: string
    salary_grade: string
    bank_account: string nullable
    tax_number: string nullable
    social_security_number: string nullable
    emergency_contact_name: string
    emergency_contact_phone: string
    additional_info: json nullable
    relationships:
      belongsTo: Department
      hasMany: Course, Schedule
      belongsToMany: Subject
    softDeletes: true
    timestamps: true

  Department:
    name: string unique
    code: string unique
    description: text nullable
    head_teacher_id: id foreign:teachers nullable
    academic_year_id: id foreign
    status: string default:'active'
    relationships:
      belongsTo: Teacher:head, AcademicYear
      hasMany: Teacher, Course, Subject
    softDeletes: true
    timestamps: true

  Subject:
    name: string
    code: string unique
    department_id: id foreign
    description: text nullable
    academic_year_id: id foreign
    status: string default:'active'
    relationships:
      belongsTo: Department, AcademicYear
      belongsToMany: Teacher, Course
    softDeletes: true
    timestamps: true

  Course:
    code: string unique
    name: string
    subject_id: id foreign
    department_id: id foreign
    academic_year_id: id foreign
    description: text nullable
    credits: integer
    hours_per_week: integer
    course_type: string
    education_level: string
    semester: string
    max_students: integer
    prerequisites: json nullable
    syllabus: text nullable
    objectives: text nullable
    assessment_method: string
    status: string default:'active'
    relationships:
      belongsTo: Department, Subject, AcademicYear
      belongsToMany: Teacher
      hasMany: CourseEnrollment, Schedule, Material, Grade
    softDeletes: true
    timestamps: true

  CourseEnrollment:
    student_id: id foreign
    course_id: id foreign
    academic_year_id: id foreign
    semester: string
    status: string default:'active'
    relationships:
      belongsTo: Student, Course, AcademicYear
      hasMany: Grade, Attendance
    softDeletes: true
    timestamps: true

  Grade:
    student_id: id foreign
    course_id: id foreign
    course_enrollment_id: id foreign
    academic_year_id: id foreign
    grade_value: decimal:5,2
    grade_type: string
    evaluation_date: date
    recorded_by: id foreign:teachers
    relationships:
      belongsTo: Student, Course, CourseEnrollment, Teacher:recorder, AcademicYear
    softDeletes: true
    timestamps: true

  Schedule:
    course_id: id foreign
    teacher_id: id foreign
    academic_year_id: id foreign
    day_of_week: string
    start_time: time
    end_time: time
    room: string
    relationships:
      belongsTo: Course, Teacher, AcademicYear
    softDeletes: true
    timestamps: true

  Payment:
    student_id: id foreign
    academic_year_id: id foreign
    amount: decimal:10,2
    payment_type: string
    payment_date: date
    status: string default:'pending'
    reference_number: string unique
    semester: string
    relationships:
      belongsTo: Student, AcademicYear
      hasMany: PaymentDetail
    softDeletes: true
    timestamps: true

  PaymentDetail:
    payment_id: id foreign
    fee_type: string
    amount: decimal:10,2
    description: text nullable
    relationships:
      belongsTo: Payment
    softDeletes: true
    timestamps: true

  Report:
    title: string
    type: string
    academic_year_id: id foreign
    semester: string nullable
    parameters: json nullable
    generated_by: id foreign:users
    file_path: string nullable
    status: string default:'generated'
    relationships:
      belongsTo: User:generator, AcademicYear
    softDeletes: true
    timestamps: true

controllers:
  AcademicYear:
    resource: web
    methods:
      index:
        query: orderBy:year,desc paginate:20
      store:
        validate: required
        save: academic_year
        flash: academic_year.created
      update:
        validate: required
        save: academic_year
        flash: academic_year.updated

  Report:
    resource: web
    methods:
      index:
        query: where:academic_year_id with:academicYear,generator paginate
      create:
        render: report.create with:academicYears
      store:
        validate: required
        save: report
        dispatch: GenerateReport
        flash: report.generation_started
      show:
        render: report.show with:academicYear,generator

1. Commençons par le diagramme de classe :

classDiagram
    AcademicYear "1" -- "*" Course
    AcademicYear "1" -- "*" Student
    AcademicYear "1" -- "*" Department
    AcademicYear "1" -- "*" Payment
    AcademicYear "1" -- "*" Report

    Student "1" -- "*" CourseEnrollment
    Student "1" -- "*" Grade
    Student "1" -- "*" Payment

    Teacher "1" -- "*" Course
    Teacher "1" -- "*" Schedule
    Teacher "1" -- "*" Grade

    Department "1" -- "*" Teacher
    Department "1" -- "*" Subject
    Department "1" -- "*" Course

    Course "1" -- "*" CourseEnrollment
    Course "1" -- "*" Schedule
    Course "1" -- "*" Grade

    User "*" -- "*" Role
    Role "*" -- "*" Permission

    class AcademicYear {
        +String year
        +Date start_date
        +Date end_date
        +String status
        +Boolean current
    }

    class User {
        +String first_name
        +String last_name
        +String email
        +String password
        +String phone
    }

    class Student {
        +String matricule
        +String first_name
        +String last_name
        +String email
        +Date admission_date
    }

    class Teacher {
        +String employee_id
        +String first_name
        +String last_name
        +String qualification
        +Integer experience_years
    }

    class Course {
        +String code
        +String name
        +Integer credits
        +Integer hours_per_week
        +String course_type
    }

    class Grade {
        +Decimal grade_value
        +String grade_type
        +Date evaluation_date
    }

    class Payment {
        +Decimal amount
        +String payment_type
        +Date payment_date
        +String status
    }
    
    
    2. Diagramme de cas d'utilisation :
    
    flowchart TD
    Admin[["Administrateur"]]
    Teacher[["Enseignant"]]
    Student[["Étudiant"]]

    subgraph Gestion Académique
    UC1[Gérer les années académiques]
    UC2[Gérer les départements]
    UC3[Gérer les cours]
    UC4[Gérer les enseignants]
    UC5[Gérer les étudiants]
    end

    subgraph Gestion des Cours
    UC6[Enregistrer les notes]
    UC7[Gérer les emplois du temps]
    UC8[Gérer les matériels de cours]
    end

    subgraph Gestion Financière
    UC9[Gérer les paiements]
    UC10[Générer les factures]
    end

    Admin --> UC1
    Admin --> UC2
    Admin --> UC4
    Admin --> UC5
    Teacher --> UC6
    Teacher --> UC8
    Teacher --> UC7
    Student --> UC8
    Admin --> UC9
    Admin --> UC10
    
    3. Diagramme de séquence (pour l'inscription à un cours) :
    
    sequenceDiagram
    actor Student
    participant System
    participant CourseEnrollment
    participant Course
    participant Payment

    Student->>System: Demande d'inscription au cours
    System->>Course: Vérifier disponibilité
    Course-->>System: Confirmation disponibilité
    System->>Payment: Vérifier statut paiement
    Payment-->>System: Confirmation paiement
    System->>CourseEnrollment: Créer inscription
    CourseEnrollment-->>System: Confirmation inscription
    System-->>Student: Notification succès
    
    
    
Nav bar 


<div class="min-h-screen bg-gray-100">
    <!-- Sidebar Container -->
    <aside class="fixed left-0 top-0 w-64 h-full bg-white shadow-lg">
        <!-- Logo Section -->
        <div class="h-16 flex items-center justify-between px-4 bg-blue-600">
            <h1 class="text-white text-xl font-bold">SCHOOL MANAGER</h1>
            <button class="text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            </button>
        </div>

        <!-- Navigation Menu -->
        <nav class="py-4">
            <ul class="space-y-2">
                <!-- Dashboard -->
                <li class="px-4">
                    <a href="#" class="flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span>Accueil</span>
                    </a>
                </li>

                <!-- User Management -->
                <li class="px-4">
                    <button class="w-full flex items-center justify-between gap-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2">
                        <div class="flex items-center gap-3">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span>Gestion Utilisateurs</span>
                        </div>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <ul class="mt-2 ml-11 space-y-2">
                        <li><a href="#" class="block text-gray-600 hover:text-blue-600">Utilisateurs</a></li>
                        <li><a href="#" class="block text-gray-600 hover:text-blue-600">Rôles</a></li>
                        <li><a href="#" class="block text-gray-600 hover:text-blue-600">Permissions</a></li>
                    </ul>
                </li>

                <!-- Academic Management -->
                <li class="px-4">
                    <button class="w-full flex items-center justify-between gap-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2">
                        <div class="flex items-center gap-3">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span>Académique</span>
                        </div>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <ul class="mt-2 ml-11 space-y-2">
                        <li><a href="#" class="block text-gray-600 hover:text-blue-600">Années Académiques</a></li>
                        <li><a href="#" class="block text-gray-600 hover:text-blue-600">Départements</a></li>
                        <li><a href="#" class="block text-gray-600 hover:text-blue-600">Matières</a></li>
                        <li><a href="#" class="block text-gray-600 hover:text-blue-600">Cours</a></li>
                    </ul>
                </li>

                <!-- Student Management -->
                <li class="px-4">
                    <button class="w-full flex items-center justify-between gap-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2">
                        <div class="flex items-center gap-3">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>Étudiants</span>
                        </div>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <ul class="mt-2 ml-11 space-y-2">
                        <li><a href="#" class="block text-gray-600 hover:text-blue-600">Liste des Étudiants</a></li>
                        <li><a href="#" class="block text-gray-600 hover:text-blue-600">Inscriptions</a></li>
                        <li><a href="#" class="block text-gray-600 hover:text-blue-600">Présences</a></li>
                    </ul>
                </li>

                <!-- Teacher Management -->
                <li class="px-4">
                    <button class="w-full flex items-center justify-between gap-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2">
                        <div class="flex items-center gap-3">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Enseignants</span>
                        </div>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <ul class="mt-2 ml-11 space-y-2">
                        <li><a href="#" class="block text-gray-600 hover:text-blue-600">Liste des Enseignants</a></li>
                        <li><a href="#" class="block text-gray-600 hover:text-blue-600">Emplois du temps</a></li>
                        <li><a href="#" class="block text-gray-600 hover:text-blue-600">Matières enseignées</a></li>
                    </ul>
                </li>

                <!-- Finance Management -->
                <li class="px-4">
                    <button class="w-full flex items-center justify-between gap-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2">
                        <div class="flex items-center gap-3">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Finances</span>
                        </div>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <ul class="mt-2 ml-11 space-y-2">
                        <li><a href="#" class="block text-gray-600 hover:text-blue-600">Paiements</a></li>
                        <li><a href="#" class="block text-gray-600 hover:text-blue-600">Détails des frais</a></li>
                        <li><a href="#" class="block text-gray-600 hover:text-blue-600">Factures</a></li>
                    </ul>
                </li>

                <!-- Reports -->
                <li class="px-4">
                    <button class="w-full flex items-center justify-between gap-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2">
                        <div class="flex items-center gap-3">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Rapports</span>
                        </div>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <ul class="mt-2 ml-11 space-y-2">
                        <li><a href="#" class="block text-gray-600 hover:text-blue-600">Rapports Académiques</a></li>
                        <li><a href="#" class="block text-gray-600 hover:text-blue-600">Rapports Financiers</a></li>
                        <li><a href="#" class="block text-gray-600 hover:text-blue-600">Statistiques</a></li>
                    </ul>
                </li>
            </ul>
        </nav>
    </aside>
</div>
