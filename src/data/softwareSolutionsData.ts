import { AiDecisionTransformationResult } from '../types';

export interface SoftwarePillarInfo {
  id: string;
  title: string;
  shortTitle: string;
  tagline: string;
  bullets: string[];
  iconName: string;
  badge: string;
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    accent: string;
    lightBg: string;
  };
  metrics: Array<{ label: string; value: string; subtext: string }>;
  deliverables: string[];
  techStack: string[];
}

export const SOFTWARE_PILLARS: SoftwarePillarInfo[] = [
  {
    id: 'industry-specific',
    title: 'Industry-Specific Software Development',
    shortTitle: 'Industry Solutions',
    tagline: 'Engineered for strict regulatory compliance, extreme scalability, and vertical domain mastery.',
    bullets: [
      'Serving diverse sectors: Healthcare, Insurance, Retail, Manufacturing, and beyond',
      'Develop secure, scalable solutions that comply with industry regulations (HIPAA, SOC 2, ISO 27001, NAIC, FDA, FSMA)',
      'Increase operational efficiency with tailored internal and client-facing applications',
    ],
    iconName: 'Building2',
    badge: 'Vertical Mastery',
    colorScheme: {
      bg: 'bg-emerald-900',
      border: 'border-emerald-700',
      text: 'text-emerald-700',
      accent: 'emerald',
      lightBg: 'bg-emerald-50',
    },
    metrics: [
      { label: 'Regulatory Compliance', value: '100% Audit-Ready', subtext: 'HIPAA, SOC 2 Type II, ISO 27001' },
      { label: 'Operational Efficiency', value: '+42% Throughput', subtext: 'Automated internal dispatch & client portals' },
      { label: 'Vertical Deployments', value: '5+ Key Sectors', subtext: 'Healthcare, Insurance, Retail, Mfg, AgTech' },
    ],
    deliverables: [
      'HIPAA / HITECH Patient Portals & Clinical EHR Bridges',
      'Insurance Claims Underwriting & Policyholder Management Engines',
      'Manufacturing Execution Systems (MES) & SCADA Telemetry Gateways',
      'Omnichannel Retail Inventory & High-Velocity POS Backbones',
    ],
    techStack: ['Node.js / Go', 'PostgreSQL / TimescaleDB', 'GraphQL / gRPC', 'Kubernetes / Cloud Run', 'Terraform / Vault'],
  },
  {
    id: 'custom-business',
    title: 'Custom Business Software Solutions',
    shortTitle: 'Custom Business Software',
    tagline: 'High-retention CRM, enterprise e-commerce platforms, and unified multi-platform business workflows.',
    bullets: [
      'Boost customer retention with personalized CRM (Customer Relationship Management) systems',
      'Increase online sales with robust enterprise e-commerce platforms',
      'Streamline workflows with integrated desktop, web, mobile, and cloud-native applications',
    ],
    iconName: 'Briefcase',
    badge: 'Enterprise Growth',
    colorScheme: {
      bg: 'bg-blue-900',
      border: 'border-blue-700',
      text: 'text-blue-700',
      accent: 'blue',
      lightBg: 'bg-blue-50',
    },
    metrics: [
      { label: 'Customer Retention Lift', value: '+34% LTV', subtext: 'Intelligent cohort segmentation & automated re-engagement' },
      { label: 'E-Commerce Conversion', value: '+28% Checkout', subtext: 'Sub-second catalog search & multi-currency payment pipelines' },
      { label: 'Workflow Efficiency', value: '3.5x Faster', subtext: 'Unified desktop, web, and cloud-native sync' },
    ],
    deliverables: [
      'Personalized CRM with automated pipeline management & customer health scoring',
      'Enterprise Headless E-Commerce with real-time inventory & ERP synchronization',
      'Unified Desktop (Electron), Web (Next.js/Vite), and Cloud-Native Microservices',
      'Custom Operational Dashboards & Role-Based Access Control (RBAC) suites',
    ],
    techStack: ['React / Vite', 'Next.js / TypeScript', 'Tailwind CSS', 'Stripe / PayPal SDKs', 'Redis / RabbitMQ'],
  },
  {
    id: 'ai-integration',
    title: 'AI Development & Integration',
    shortTitle: 'AI Development & Integration',
    tagline: 'Modern data foundations, machine learning pipelines, and transformative data-to-decision engines.',
    bullets: [
      'Identify practical use cases for AI and establish a modern data foundation',
      'Implement AI solutions to automate processes and improve decision-making',
      'Turn your data into foresight with predictive analytics',
    ],
    iconName: 'BrainCircuit',
    badge: 'Research to Production',
    colorScheme: {
      bg: 'bg-purple-900',
      border: 'border-purple-700',
      text: 'text-purple-700',
      accent: 'purple',
      lightBg: 'bg-purple-50',
    },
    metrics: [
      { label: 'Data to Decision Latency', value: '< 150 ms', subtext: 'Real-time inference & automated routing' },
      { label: 'Predictive Accuracy', value: '94.8% AUC', subtext: 'Deep learning models trained on domain feature stores' },
      { label: 'Manual Process Reduction', value: '-65% Overhead', subtext: 'RAG LLMs, automated classification & anomaly detection' },
    ],
    deliverables: [
      'Modern Lakehouse Data Foundation (Delta Lake / BigQuery / Iceberg)',
      'Domain-Tuned RAG (Retrieval-Augmented Generation) & Agentic Reasoning',
      'Real-Time Computer Vision & Sensor Anomaly Detection Pipelines',
      'Predictive Analytics & Foresight Engine (Time-series forecasting, churn risk)',
    ],
    techStack: ['Gemini 2.5 / 1.5 Pro', 'PyTorch / ONNX', 'LangChain / LlamaIndex', 'Delta Lake / Snowflake', 'Vector DBs (Milvus/Pinecone)'],
  },
  {
    id: 'mobile-apps',
    title: 'Mobile Application Development',
    shortTitle: 'Mobile Apps',
    tagline: 'High-engagement native and cross-platform mobile apps with offline-first synchronization.',
    bullets: [
      'Create engaging native mobile apps that drive user acquisition and retention',
      'Reduce development costs with cross-platform and hybrid solutions',
      'Provide end-to-end services: from UX (User Experience) design to post-launch support and updates',
    ],
    iconName: 'Smartphone',
    badge: 'iOS & Android',
    colorScheme: {
      bg: 'bg-amber-900',
      border: 'border-amber-700',
      text: 'text-amber-700',
      accent: 'amber',
      lightBg: 'bg-amber-50',
    },
    metrics: [
      { label: 'User Retention Rate', value: '68% D-30', subtext: 'Gamified UX, fluid motion & push notification loops' },
      { label: 'Cost Reduction', value: '-45% Dev Cost', subtext: 'Shared codebases via Flutter / React Native with native modules' },
      { label: 'App Store Rating', value: '4.9 ★ Average', subtext: 'Zero-crash telemetry, offline-first SQLite cache' },
    ],
    deliverables: [
      'Native iOS (Swift/SwiftUI) & Native Android (Kotlin/Jetpack Compose) Apps',
      'Cross-Platform Flutter & React Native Solutions with 90%+ code reuse',
      'Field-Ready Offline-First Architecture with background bi-directional sync',
      'End-to-End Product Lifecycle: Figma UX, CI/CD, App Store & Play Store publishing',
    ],
    techStack: ['React Native / Expo', 'Flutter / Dart', 'Swift / Kotlin', 'SQLite / WatermelonDB', 'Fastlane / App Store Connect'],
  },
];

export interface IndustrySectorPreset {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  regulations: string[];
  primaryGoal: string;
  sampleDataDescription: string;
  challenges: string;
  defaultResult: AiDecisionTransformationResult;
}

export const INDUSTRY_SECTOR_PRESETS: IndustrySectorPreset[] = [
  {
    id: 'healthcare',
    name: 'Healthcare & Life Sciences',
    tagline: 'HIPAA-compliant clinical decision support, diagnostic vision, and patient care workflows.',
    icon: 'Activity',
    regulations: ['HIPAA / HITECH', 'FDA 21 CFR Part 11', 'HL7 / FHIR', 'SOC 2 Type II'],
    primaryGoal: 'Accelerate diagnostic review, automate clinical documentation, and predict patient readmission risk.',
    sampleDataDescription: 'EHR records, HL7 telemetry feeds, DICOM pathology scans, and post-discharge recovery logs.',
    challenges: 'High physician documentation burnout, delayed triage decision-making, and fragmented siloed legacy EHR systems.',
    defaultResult: {
      id: 'transform-healthcare-demo',
      timestamp: new Date().toISOString(),
      industry: 'Healthcare & Life Sciences',
      executiveSummary: 'Deploy an enterprise clinical decision intelligence platform featuring FHIR-native interoperability, real-time diagnostic triage, and predictive patient readmission alerts—delivering measurable doctor time savings and regulatory compliance.',
      modernDataFoundation: {
        lakehouseArchitecture: 'HIPAA-hardened Medallion Lakehouse with automated PHI de-identification and cryptographic pseudonymization.',
        storageEngines: ['PostgreSQL (Audit logs)', 'Cloud Healthcare FHIR Store', 'TimescaleDB (Vitals telemetry)'],
        ingestionPipelines: 'Sub-second HL7v2 / FHIR REST stream with real-time Kafka event bus and zero-trust mutual TLS.',
        governanceAndCompliance: ['HIPAA / HITECH audited BAA', 'FDA SaMD (Software as a Medical Device) Tier II', 'SOC 2 Type II encryption at rest and in transit'],
      },
      practicalAiUseCases: [
        {
          title: 'Automated Clinical Note Synthesis & Coding',
          description: 'Ambient audio & clinical notes to structured ICD-10 / CPT billing codes with human physician sign-off.',
          mlParadigm: 'Domain-Specialized Healthcare LLMs + Named Entity Recognition (NER)',
          impact: 'Transformational',
          estimatedRoi: '3.4 hours saved per physician daily ($140k/yr per clinician)',
          timeToProduction: '8 Weeks',
        },
        {
          title: 'Predictive 30-Day Readmission Early Warning',
          description: 'Continuous vital trend analysis identifying decompensating patients 48 hours prior to acute crises.',
          mlParadigm: 'Ensemble Gradient Boosting (XGBoost) + Transformer Time-Series',
          impact: 'Critical',
          estimatedRoi: '-32% avoidable Medicare penalty fees',
          timeToProduction: '12 Weeks',
        },
        {
          title: 'Diagnostic Imaging Quality & Anomaly Triage',
          description: 'Computer vision pre-screening of pathology and X-ray scans to prioritize critical findings on radiologist worklists.',
          mlParadigm: 'Vision Transformer (ViT-H14) + DenseNet-121',
          impact: 'High',
          estimatedRoi: '70% reduction in critical finding turnaround time',
          timeToProduction: '14 Weeks',
        },
      ],
      automatedDecisions: [
        {
          triggerEvent: 'Patient discharge summary drafted with high readmission score (>0.72)',
          aiEvaluationEngine: 'Clinical Risk Inference Agent cross-referencing comorbidities & medication adherence',
          automatedAction: 'Automatically schedules home health check-in, dispatches smart pillbox reminders, and flags PCP follow-up.',
          humanOversightLevel: 'Supervising Nurse Practitioner confirmation required with 1-click approve',
        },
        {
          triggerEvent: 'Lab report flags critical troponin / sepsis biomarker spike',
          aiEvaluationEngine: 'Real-time ICU Telemetry Decision Filter',
          automatedAction: 'Triggers priority mobile push to attending physician and initiates emergency clinical sepsis protocol.',
          humanOversightLevel: 'Instant alert with required biometric doctor acknowledgement',
        },
      ],
      predictiveAnalyticsForesight: [
        {
          kpi: '30-Day Readmission Rate',
          baselineValue: '18.4%',
          projectedValue: '11.8%',
          foresightHorizon: '6 Months',
          confidencePercent: 93,
          riskMitigation: 'Targeted post-discharge nurse telehealth visits within 72 hours',
        },
        {
          kpi: 'Average Charting Time',
          baselineValue: '112 mins/day',
          projectedValue: '38 mins/day',
          foresightHorizon: '30 Days',
          confidencePercent: 96,
          riskMitigation: 'Ambient clinical speech-to-text with one-click verification',
        },
        {
          kpi: 'Bed Capacity Optimization',
          baselineValue: '82% efficiency',
          projectedValue: '94% efficiency',
          foresightHorizon: '90 Days',
          confidencePercent: 89,
          riskMitigation: 'Predictive discharge timing engine aligning pharmacy and transport logistics',
        },
      ],
      customSoftwareArchitecture: {
        crmModules: ['Patient Care Journey Navigator', 'Omnichannel Appointment & Telehealth Bridge', 'Family Caregiver Portal'],
        ecommerceCapabilities: ['Self-Service Copay & Billing Checkout', 'Prescription Home Delivery Refill Gateway'],
        crossPlatformStack: ['React Native Mobile App (iOS / Android)', 'Electron Desktop Clinical Workstation', 'Next.js Clinical Admin Web Portal'],
        cloudNativeServices: ['Kubernetes Microservices', 'Kafka Message Bus', 'Vault Secret Manager', 'FHIR Bridge API'],
      },
      mobileDevelopmentBlueprint: {
        recommendedFramework: 'React Native + Swift/Kotlin Native Bridge for biometric health peripherals',
        nativeFeatures: ['TouchID/FaceID Biometric Auth', 'Bluetooth LE integration with glucometers and pulse oximeters', 'HIPAA-compliant push notification tokens'],
        offlineCapabilities: ['Encrypted local SQLite realm with automatic sync upon clinic Wi-Fi connection', 'Offline triage checklists for home health nurses'],
        uxBestPractices: ['WCAG 2.1 AAA high contrast accessibility', 'Single-tap emergency call triggers', 'Large touch targets (>48px)'],
      },
      complianceFrameworks: ['HIPAA Security Rule', 'HITECH Breach Notification', 'FDA 21 CFR Part 11', 'HL7 FHIR Release 4'],
      modelUsed: 'gemini-3.8-flash (Enterprise Healthcare Engine)',
    },
  },
  {
    id: 'insurance',
    name: 'Insurance & Risk Management',
    tagline: 'Automated claims processing, actuarial risk scoring, and hyper-personalized policyholder CRM.',
    icon: 'ShieldCheck',
    regulations: ['NAIC Model Laws', 'SOC 2 Type II', 'GLBA (Gramm-Leach-Bliley)', 'State DOI Regulations'],
    primaryGoal: 'Accelerate claims adjudication from days to minutes, detect fraudulent patterns, and personalize retention.',
    sampleDataDescription: 'FNOL (First Notice of Loss) incident photos, telematics driver logs, property assessments, and actuarial tables.',
    challenges: 'High claims processing cost ($62/claim), fraudulent leakages estimated at 10% of claims, and policyholder churn.',
    defaultResult: {
      id: 'transform-insurance-demo',
      timestamp: new Date().toISOString(),
      industry: 'Insurance & Risk Management',
      executiveSummary: 'Transform policyholder operations with an AI-first claims automation pipeline that leverages computer vision for instant damage assessment, machine learning for fraud scoring, and personalized CRM workflows to boost retention by 38%.',
      modernDataFoundation: {
        lakehouseArchitecture: 'Real-time Apache Iceberg on Google Cloud Storage with automated PII masking and immutable ledger audit logging.',
        storageEngines: ['Cloud Spanner (Policy records)', 'BigQuery (Actuarial analytics)', 'Vector DB (Incident photo embeddings)'],
        ingestionPipelines: 'Multi-stream ingestion supporting mobile FNOL photo uploads, IoT vehicle telematics, and weather API feeds.',
        governanceAndCompliance: ['GLBA financial privacy compliance', 'SOC 2 Type II automated controls', 'State Insurance Commission audit trail'],
      },
      practicalAiUseCases: [
        {
          title: 'Optical Damage Assessment & Estimating',
          description: 'Computer vision analysis of vehicle or property photos estimating repair costs and approving low-risk claims automatically.',
          mlParadigm: 'YOLOv8 + Segmentation Vision Transformers (Mask R-CNN)',
          impact: 'Transformational',
          estimatedRoi: '80% straight-through processing for claims under $2,500',
          timeToProduction: '10 Weeks',
        },
        {
          title: 'Predictive Fraud Anomaly Detection (SIU)',
          description: 'Graph neural networks detecting organized claims fraud rings, staged accidents, and duplicate photographic submissions.',
          mlParadigm: 'Graph Convolutional Networks (GCN) + Isolation Forest',
          impact: 'Critical',
          estimatedRoi: '$4.2M annual loss prevention per 100k policies',
          timeToProduction: '12 Weeks',
        },
        {
          title: 'Dynamic Policyholder Retention & Pricing',
          description: 'Personalized risk profiling and automated renewal discounts triggered by positive telematics safety scores.',
          mlParadigm: 'Survival Analysis + Reinforcement Learning with Human Feedback',
          impact: 'High',
          estimatedRoi: '+28% policy renewal retention over 24 months',
          timeToProduction: '8 Weeks',
        },
      ],
      automatedDecisions: [
        {
          triggerEvent: 'FNOL auto collision photo uploaded with fraud score < 0.12 and repair estimate < $2,000',
          aiEvaluationEngine: 'Instant Claims Adjudicator evaluating metadata, policy limits, and optical severity',
          automatedAction: 'Immediately approves payout via PayPal/ACH and generates repair work order with approved local body shop.',
          humanOversightLevel: 'Automated straight-through with random 5% audit sampling by senior adjuster',
        },
        {
          triggerEvent: 'Vehicle telematics logs 30-day zero harsh-braking streak',
          aiEvaluationEngine: 'Behavioral Actuarial Policy Engine',
          automatedAction: 'Sends personalized congratulatory notification with 12% renewal premium reduction certificate.',
          humanOversightLevel: 'Fully automated rule-verified dispatch',
        },
      ],
      predictiveAnalyticsForesight: [
        {
          kpi: 'Average Claim Settlement Cycle',
          baselineValue: '6.8 Business Days',
          projectedValue: '3.5 Hours',
          foresightHorizon: '90 Days',
          confidencePercent: 95,
          riskMitigation: 'Instant optical assessment for damage below $3,000 threshold',
        },
        {
          kpi: 'Policyholder 1-Year Retention',
          baselineValue: '73.2%',
          projectedValue: '88.6%',
          foresightHorizon: '12 Months',
          confidencePercent: 91,
          riskMitigation: 'Predictive churn alerts offering proactive rate lock guarantees',
        },
        {
          kpi: 'Loss Adjustment Expense (LAE)',
          baselineValue: '12.4% of premium',
          projectedValue: '7.1% of premium',
          foresightHorizon: '6 Months',
          confidencePercent: 94,
          riskMitigation: 'Elimination of manual adjuster site visits on minor claims',
        },
      ],
      customSoftwareArchitecture: {
        crmModules: ['Policyholder 360 Dashboard', 'Proactive Renewal & Cross-Sell Engine', 'Agent Commission & Performance Hub'],
        ecommerceCapabilities: ['Direct-to-Consumer Quote-and-Buy Engine', 'One-Click Add-on Rider Checkout'],
        crossPlatformStack: ['Mobile Policyholder App (Flutter)', 'Web Claims Adjuster Workbench (React/Vite)', 'Executive Analytics Portal'],
        cloudNativeServices: ['Cloud Run Microservices', 'Eventarc Event Streams', 'Cloud SQL for PostgreSQL'],
      },
      mobileDevelopmentBlueprint: {
        recommendedFramework: 'Flutter for unified iOS and Android code with high performance camera access',
        nativeFeatures: ['Camera with edge-guided photo alignment for vehicle damage', 'Background accelerometer telematics', 'Biometric login and Apple/Google Wallet ID cards'],
        offlineCapabilities: ['Offline FNOL draft saving with automatic queue upload when cellular connection returns', 'Cached insurance digital ID cards'],
        uxBestPractices: ['3-step emergency accident guide', 'One-touch roadside dispatch button with GPS telemetry'],
      },
      complianceFrameworks: ['NAIC Model Law #670', 'Gramm-Leach-Bliley Act (GLBA)', 'PCI-DSS Level 1', 'SOC 2 Type II'],
      modelUsed: 'gemini-3.8-flash (Enterprise Insurance Engine)',
    },
  },
  {
    id: 'retail',
    name: 'Retail & E-Commerce',
    tagline: 'Omnichannel inventory routing, personalized recommendation engines, and high-conversion mobile storefronts.',
    icon: 'ShoppingBag',
    regulations: ['PCI-DSS Level 1', 'CCPA / CPRA', 'GDPR', 'Accessibility ADA / WCAG 2.1'],
    primaryGoal: 'Increase online conversion rates, prevent out-of-stocks via demand forecasting, and elevate customer lifetime value.',
    sampleDataDescription: 'POS receipts, e-commerce cart events, warehouse stock levels, customer clickstreams, and marketing attribution data.',
    challenges: 'High cart abandonment (71%), stockouts on viral products costing 8% of revenue, and rising customer acquisition costs (CAC).',
    defaultResult: {
      id: 'transform-retail-demo',
      timestamp: new Date().toISOString(),
      industry: 'Retail & E-Commerce',
      executiveSummary: 'Deliver an enterprise headless e-commerce and omnichannel CRM ecosystem that turns consumer clickstream and inventory data into real-time personalized shopping experiences, dynamic markdown decisions, and predictive supply reordering.',
      modernDataFoundation: {
        lakehouseArchitecture: 'Real-time medallion lakehouse streaming web clicks, store POS, and fulfillment warehouse events into BigQuery.',
        storageEngines: ['Redis Enterprise (Session cache & cart)', 'PostgreSQL (Product catalog)', 'BigQuery (Customer 360)'],
        ingestionPipelines: 'Clickstream telemetry streaming via Segment/RudderStack with sub-50ms vector similarity lookup.',
        governanceAndCompliance: ['PCI-DSS 4.0 tokenized checkout', 'CCPA/GDPR automated data consent and erasure', 'SOC 2 Type II audit logs'],
      },
      practicalAiUseCases: [
        {
          title: 'Hyper-Personalized Recommendation & Bundle Engine',
          description: 'Context-aware collaborative filtering delivering dynamic homepage layouts and upsell offers per individual shopper.',
          mlParadigm: 'Two-Tower Deep Neural Networks + Approximate Nearest Neighbors (ANN)',
          impact: 'Transformational',
          estimatedRoi: '+24% Average Order Value (AOV)',
          timeToProduction: '6 Weeks',
        },
        {
          title: 'Predictive Inventory Demand & Stockout Prevention',
          description: 'Forecasting SKU demand across 40+ fulfillment centers taking into account social trends, weather, and historical seasonality.',
          mlParadigm: 'Temporal Fusion Transformers (TFT) + Prophet Ensemble',
          impact: 'Critical',
          estimatedRoi: '82% reduction in out-of-stock lost revenues',
          timeToProduction: '8 Weeks',
        },
        {
          title: 'Conversational Shopping Assistant & Visual Search',
          description: 'Multimodal AI concierge allowing shoppers to upload photos of outfits or ask natural-language styling questions.',
          mlParadigm: 'Multimodal Gemini Pro + Vector Image Embeddings',
          impact: 'High',
          estimatedRoi: '+31% mobile checkout completion rate',
          timeToProduction: '6 Weeks',
        },
      ],
      automatedDecisions: [
        {
          triggerEvent: 'Shopper exhibits high exit-intent behavior with cart value > $85',
          aiEvaluationEngine: 'Real-Time Propensity-to-Buy Model evaluating past purchase velocity and price elasticity',
          automatedAction: 'Dynamically serves personalized bundle discount or free express shipping timer tailored to exact margin threshold.',
          humanOversightLevel: 'Pre-configured margin bounds guardrails with automated execution',
        },
        {
          triggerEvent: 'Regional warehouse stock for flagship SKU falls below 5 days of forecasted demand',
          aiEvaluationEngine: 'Omnichannel Supply Optimization Algorithm',
          automatedAction: 'Automatically generates supplier purchase order and redirects online orders to secondary regional hub.',
          humanOversightLevel: 'Inventory manager 1-click approval for orders > $15,000',
        },
      ],
      predictiveAnalyticsForesight: [
        {
          kpi: 'E-Commerce Conversion Rate',
          baselineValue: '2.1%',
          projectedValue: '3.6%',
          foresightHorizon: '60 Days',
          confidencePercent: 94,
          riskMitigation: 'Sub-second page speeds, instant Apple Pay / PayPal checkout, and visual search',
        },
        {
          kpi: 'Repeat Purchase Rate (90-Day)',
          baselineValue: '23.5%',
          projectedValue: '39.2%',
          foresightHorizon: '6 Months',
          confidencePercent: 92,
          riskMitigation: 'Personalized CRM re-engagement journeys based on consumption lifecycle',
        },
        {
          kpi: 'Fulfillment Cost Per Order',
          baselineValue: '$8.40',
          projectedValue: '$5.95',
          foresightHorizon: '90 Days',
          confidencePercent: 90,
          riskMitigation: 'Smart split-shipment prevention and geo-optimized inventory allocation',
        },
      ],
      customSoftwareArchitecture: {
        crmModules: ['Customer Lifetime Value (LTV) Segmentation', 'Automated SMS / Email Workflow Builder', 'Loyalty Tier & Rewards Engine'],
        ecommerceCapabilities: ['Headless Next.js Storefront', 'Microservice Checkout Gateway', 'Unified POS Store Sync'],
        crossPlatformStack: ['React Native Mobile Shopping App', 'Store Associate Mobile POS App (iPad / Android)', 'Web Merchandising Command Center'],
        cloudNativeServices: ['Fastly / Cloudflare Edge CDN', 'Kubernetes Scaled Cart Microservices', 'Elasticsearch Product Index'],
      },
      mobileDevelopmentBlueprint: {
        recommendedFramework: 'React Native for seamless parity between web components and mobile storefront',
        nativeFeatures: ['Apple Pay & Google Pay instant 1-tap checkout', 'Camera barcode and visual product search', 'Rich push notifications with personalized product imagery'],
        offlineCapabilities: ['Offline product browsing with cached catalogs and wishlist persistence', 'Optimistic cart updates'],
        uxBestPractices: ['Sub-200ms screen transitions', 'Bottom sheet cart drawer', 'Haptic feedback on add-to-cart'],
      },
      complianceFrameworks: ['PCI-DSS Level 1 v4.0', 'CCPA / CPRA', 'GDPR', 'ADA Title III Web Accessibility'],
      modelUsed: 'gemini-3.8-flash (Enterprise Retail Engine)',
    },
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing & Industry 4.0',
    tagline: 'Predictive maintenance, computer vision defect inspection, and SCADA-integrated production execution.',
    icon: 'Factory',
    regulations: ['ISO 9001', 'ISO 27001', 'OSHA Safety Standards', 'ISA-95 Enterprise-Control Integration'],
    primaryGoal: 'Achieve zero unplanned machine downtime, eliminate defective parts before shipping, and optimize throughput.',
    sampleDataDescription: 'Vibration accelerometer logs, high-speed optical camera feeds, thermal sensors, PLC status, and MES production batches.',
    challenges: 'Unplanned downtime costs $22,000/hour, manual visual defect inspection is error-prone, and siloed legacy SCADA hardware.',
    defaultResult: {
      id: 'transform-manufacturing-demo',
      timestamp: new Date().toISOString(),
      industry: 'Manufacturing & Industry 4.0',
      executiveSummary: 'Establish a factory-floor IoT and computer vision intelligence backbone that integrates with existing PLCs and SCADA networks to automate quality assurance, predict mechanical failure 72 hours in advance, and orchestrate maintenance work orders.',
      modernDataFoundation: {
        lakehouseArchitecture: 'Hybrid Edge-to-Cloud architecture with local edge inference on NVIDIA Jetson devices and cloud data lakehouse on Google Cloud.',
        storageEngines: ['TimescaleDB (High-frequency sensor metrics)', 'PostgreSQL (MES batch records)', 'Object Store (Defect images)'],
        ingestionPipelines: 'MQTT / OPC-UA industrial protocol gateway streaming at 1,000 samples/sec with local edge filtering.',
        governanceAndCompliance: ['ISA-95 Level 3/4 compliance', 'ISO 9001 quality audit certification logs', 'Air-gapped edge security protocols'],
      },
      practicalAiUseCases: [
        {
          title: 'High-Speed Automated Optical Inspection (AOI)',
          description: 'Sub-millimeter defect detection on assembly lines running at 600 units/min classifying scratches, cracks, and weld voids.',
          mlParadigm: 'YOLOv8x + Autoencoder Unsupervised Anomaly Detection',
          impact: 'Critical',
          estimatedRoi: '99.4% defect escape reduction ($1.8M saved in scrap/warranty)',
          timeToProduction: '8 Weeks',
        },
        {
          title: 'Predictive Bearing & Motor Failure Alerting',
          description: 'Fast Fourier Transform (FFT) vibration harmonic analysis forecasting bearing spalling 72 hours prior to catastrophic seizure.',
          mlParadigm: 'LSTM Autoencoders + Spectral Feature Engineering',
          impact: 'Transformational',
          estimatedRoi: '-85% unplanned assembly line downtime',
          timeToProduction: '10 Weeks',
        },
        {
          title: 'Dynamic Production Line Balancing & OEE Optimization',
          description: 'Reinforcement learning algorithm adjusting conveyor speeds and robotic cell work allocations in real time.',
          mlParadigm: 'Deep Q-Networks (DQN) + Discrete Event Simulation',
          impact: 'High',
          estimatedRoi: '+14% Overall Equipment Effectiveness (OEE)',
          timeToProduction: '12 Weeks',
        },
      ],
      automatedDecisions: [
        {
          triggerEvent: 'Optical camera detects structural crack on component on Conveyor Line 2',
          aiEvaluationEngine: 'Edge Vision Inference Unit running at 15ms inference latency',
          automatedAction: 'Immediately fires pneumatic reject actuator, diverts defective part to inspection bin, and logs batch serial.',
          humanOversightLevel: 'Fully autonomous edge execution with quality supervisor dashboard alerts',
        },
        {
          triggerEvent: 'Extruder Motor 4 vibration harmonics exceed 95th percentile baseline threshold',
          aiEvaluationEngine: 'Predictive Maintenance Health Model',
          automatedAction: 'Generates urgent work order in ERP, reserves spare bearing in inventory, and schedules maintenance during planned shift change.',
          humanOversightLevel: 'Plant Maintenance Supervisor automated push notification',
        },
      ],
      predictiveAnalyticsForesight: [
        {
          kpi: 'Overall Equipment Effectiveness (OEE)',
          baselineValue: '68.5%',
          projectedValue: '84.2%',
          foresightHorizon: '90 Days',
          confidencePercent: 93,
          riskMitigation: 'Targeted predictive maintenance scheduling during off-shift periods',
        },
        {
          kpi: 'Defect Escape Rate (PPM)',
          baselineValue: '480 PPM',
          projectedValue: '12 PPM',
          foresightHorizon: '45 Days',
          confidencePercent: 97,
          riskMitigation: '100% in-line computer vision inspection replaces 5% manual sampling',
        },
        {
          kpi: 'Unplanned Downtime (Hours/Month)',
          baselineValue: '28.4 Hours',
          projectedValue: '3.1 Hours',
          foresightHorizon: '6 Months',
          confidencePercent: 91,
          riskMitigation: 'Vibration and thermal trend alerts with 72-hour lead time',
        },
      ],
      customSoftwareArchitecture: {
        crmModules: ['Supplier Quality Collaboration Portal', 'Customer RMA & Warranty Resolution Desk', 'Contract Manufacturing SLA Dashboard'],
        ecommerceCapabilities: ['B2B Spare Parts Customer Portal', 'Automated Reorder EDI Gateway'],
        crossPlatformStack: ['Floor Technician Rugged Tablet App (Android)', 'Control Room Web Wall (React/Vite)', 'Executive iOS/Android KPI App'],
        cloudNativeServices: ['Edge Kubernetes (K3s)', 'MQTT Broker (EMQX)', 'TimescaleDB Timeseries Store'],
      },
      mobileDevelopmentBlueprint: {
        recommendedFramework: 'Native Android (Kotlin) optimized for rugged Zebra / Honeywell industrial mobile computers and barcode scanners',
        nativeFeatures: ['Hardware laser barcode / RFID scanner integration', 'High-decibel audible alerts for loud factory environments', 'Thermal camera FLIR USB peripheral support'],
        offlineCapabilities: ['Full offline mode with local SQLite database for work orders inside Faraday-cage production bays', 'Local peer-to-peer Wi-Fi mesh sync'],
        uxBestPractices: ['Glove-friendly touch controls (min 64px button targets)', 'High-contrast industrial color palette', 'Voice-driven inspection checklists'],
      },
      complianceFrameworks: ['ISO 9001:2015 Quality Management', 'ISO 27001 Information Security', 'OSHA 1910 Industrial Standards', 'ISA-95 Enterprise Architecture'],
      modelUsed: 'gemini-3.8-flash (Enterprise Manufacturing Engine)',
    },
  },
  {
    id: 'agriculture',
    name: 'Agriculture & Food Supply Chains',
    tagline: 'Computer vision crop monitoring, pest detection, food grading, and automated agronomist decision engines.',
    icon: 'Sprout',
    regulations: ['FSMA (Food Safety Modernization Act)', 'USDA Organic', 'GlobalGAP', 'EPA Worker Protection Standards'],
    primaryGoal: 'Detect disease and pests before yield loss, grade food produce automatically, and optimize irrigation schedules.',
    sampleDataDescription: 'UAV drone multispectral imagery, smartphone camera leaf photos, conveyor produce grading video, and soil moisture sensors.',
    challenges: 'Up to 30% crop yield loss from undetected fungal outbreaks, manual field scouting is slow, and strict food grading standards.',
    defaultResult: {
      id: 'transform-agri-demo',
      timestamp: new Date().toISOString(),
      industry: 'Agriculture & Food Supply Chains',
      executiveSummary: 'Unify field scouting, UAV drone telemetry, and packing house produce inspection into an AI-powered operating system that transforms optical imagery and soil sensor data into automated agronomic prescriptions and food grading decisions.',
      modernDataFoundation: {
        lakehouseArchitecture: 'AgTech Spatial Lakehouse linking GPS geospatial boundaries with multispectral imagery and micro-climate weather forecasts.',
        storageEngines: ['PostgreSQL with PostGIS extension', 'TimescaleDB (Soil moisture and ETc telemetry)', 'Google Cloud Storage (RGB & NDVI GeoTIFFs)'],
        ingestionPipelines: 'Field mobile app offline sync queue + drone flight log ingestion via GeoJSON endpoints.',
        governanceAndCompliance: ['FSMA Title 21 food safety audit trails', 'GlobalGAP traceability certification', 'EPA pesticide application logging compliance'],
      },
      practicalAiUseCases: [
        {
          title: 'Multispectral Early Disease & Canopy Stress Detection',
          description: 'ViT-B16 segmentation isolating chlorosis, fungal spore clusters, and water stress before visual symptoms appear to human eyes.',
          mlParadigm: 'Vision Transformers (ViT) + U-Net Leaf Masking',
          impact: 'Critical',
          estimatedRoi: '+$380/acre protected yield across high-value crops',
          timeToProduction: '4 Weeks (Active in Agri-Vision OS)',
        },
        {
          title: 'Automated Real-Time YOLOv8 Pest Identification',
          description: 'Real-time camera detection bounding aphids, mites, and beetles with severity indexing and biological IPM recommendations.',
          mlParadigm: 'YOLOv8x Deep Object Detection + Confidence Calibration',
          impact: 'Transformational',
          estimatedRoi: '-45% chemical pesticide expenditure via targeted spot-spraying',
          timeToProduction: '4 Weeks (Active in Agri-Vision OS)',
        },
        {
          title: 'Automated Post-Harvest Conveyor Food Grading',
          description: 'High-speed optical classification grading fruit by diameter, color uniformity, surface blemish, and sugar Brix estimates.',
          mlParadigm: 'Multi-Task Convolutional Neural Network + Color Calibration',
          impact: 'High',
          estimatedRoi: '3x throughput increase in packing houses with zero human grading fatigue',
          timeToProduction: '4 Weeks (Active in Agri-Vision OS)',
        },
      ],
      automatedDecisions: [
        {
          triggerEvent: 'Field scout scans crop showing bacterial blight severity index > 65 with high fungal humidity forecast',
          aiEvaluationEngine: 'Agronomic Diagnostic & Risk Model evaluating microclimate wind speed and crop growth stage',
          automatedAction: 'Issues immediate Sector 4 quarantine alert, calculates biological copper sulfate spray dosage, and dispatches drone flight plan.',
          humanOversightLevel: 'Agronomist 1-click authorization via mobile push or voice command',
        },
        {
          triggerEvent: 'Soil moisture falls below 18% with forecasted high evapotranspiration (ETc > 6.5 mm/day)',
          aiEvaluationEngine: 'Crop Growth Cycle & Irrigation Predictor',
          automatedAction: 'Automatically triggers drip irrigation solenoid valve for Sector B2 for 45 minutes during low-rate night tariff.',
          humanOversightLevel: 'Automated valve control with manual manual override switch',
        },
      ],
      predictiveAnalyticsForesight: [
        {
          kpi: 'Total Farm Harvestable Yield',
          baselineValue: '18.2 Tons/Hectare',
          projectedValue: '23.8 Tons/Hectare',
          foresightHorizon: 'Harvest Cycle (90 Days)',
          confidencePercent: 92,
          riskMitigation: 'Targeted irrigation and early pathogen containment prevent canopy necrosis',
        },
        {
          kpi: 'Grade A Produce Packout Rate',
          baselineValue: '71.4%',
          projectedValue: '88.2%',
          foresightHorizon: 'Current Season',
          confidencePercent: 95,
          riskMitigation: 'Consistent optical grading eliminates human sorting error and customer rejections',
        },
        {
          kpi: 'Irrigation Water Usage (m³/Hectare)',
          baselineValue: '4,200 m³',
          projectedValue: '3,150 m³ (-25%)',
          foresightHorizon: 'Full Season',
          confidencePercent: 96,
          riskMitigation: 'Evapotranspiration (ETc) demand-driven micro-irrigation scheduling',
        },
      ],
      customSoftwareArchitecture: {
        crmModules: ['Grower & Agronomist Dispatch CRM', 'Packhouse Buyer Traceability Portal', 'Farm Machinery Asset Tracker'],
        ecommerceCapabilities: ['Direct Farm-to-Table Wholesale Marketplace', 'Pre-Harvest Forward Contract Exchange'],
        crossPlatformStack: ['Field Scout Mobile PWA / App (iOS & Android)', 'Central Operations HUD (Vite/React)', 'Farmer Voice Assistant Hub'],
        cloudNativeServices: ['FastAPI / Node.js Microservices', 'PostGIS Geospatial DB', 'Offline SQLite Local Cache'],
      },
      mobileDevelopmentBlueprint: {
        recommendedFramework: 'React Native / PWA with Service Worker background synchronization',
        nativeFeatures: ['High-resolution camera capture with GPS EXIF tagging', 'Web Speech API voice observations', 'Torch flashlight toggle for night scouting'],
        offlineCapabilities: ['Offline-first SQLite storage storing 500+ photo inspections without cellular reception', 'Background auto-sync when field truck returns to Wi-Fi'],
        uxBestPractices: ['High sunlight contrast ratio (AAA standard)', 'One-hand bottom thumb navigation', 'Audio speech synthesis for hands-free field walks'],
      },
      complianceFrameworks: ['FSMA Section 204 Traceability', 'USDA Organic Certification', 'GlobalGAP Standards', 'EPA Worker Protection Standards'],
      modelUsed: 'gemini-3.8-flash (Agri-Vision OS Computer Vision)',
    },
  },
];
