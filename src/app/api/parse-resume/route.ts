import mammoth from "mammoth";
import { NextResponse } from "next/server";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const EXTRACTION_PROMPT = `Extract the following structured data from this trainer resume/CV. Return ONLY valid JSON, no markdown fences, no explanation.

{
  "firstName": "",
  "lastName": "",
  "email": "",
  "phone": "",
  "locationCity": "",
  "locationCountry": "",
  "linkedinUrl": "",
  "bio": "",
  "yearsOfExperience": null,
  "totalSessionsDelivered": null,
  "preferredGroupSizeMin": null,
  "preferredGroupSizeMax": null,
  "deliveryFormats": [],
  "topicsTrained": [],
  "certifications": [
    {
      "name": "",
      "issuingOrganization": "",
      "issueDate": "",
      "expiryDate": "",
      "credentialId": ""
    }
  ],
  "primaryDomains": [],
  "secondaryDomains": [],
  "dayRateUsd": null,
  "hourlyRateUsd": null,
  "rateNotes": "",
  "sampleVideoUrl": ""
}

Rules:
- For deliveryFormats, only use: "in-person", "virtual", "hybrid"
- For domains, use the exact domain names from this list: Cloud Computing, Amazon Web Services (AWS), Microsoft Azure, Google Cloud Platform (GCP), DevOps, Kubernetes & Containers, Cybersecurity, Ethical Hacking & Penetration Testing, Network Security, Data Science, Machine Learning, Artificial Intelligence, Generative AI, Deep Learning, Natural Language Processing, Python Programming, Java Programming, JavaScript & TypeScript, Full Stack Development, React & Frontend Development, Node.js & Backend Development, Blockchain & Web3, Internet of Things (IoT), Robotic Process Automation (RPA), Salesforce, SAP, ServiceNow, Power BI & Data Visualization, Tableau, SQL & Database Management, Big Data & Hadoop, Snowflake & Data Warehousing, Leadership Development, Executive Leadership, First-Time Manager Training, Change Management, Strategic Thinking & Planning, Decision Making, Coaching & Mentoring, Conflict Resolution, Team Building, Performance Management, Stakeholder Management, Communication Skills, Presentation Skills, Public Speaking, Business Writing, Negotiation Skills, Emotional Intelligence, Critical Thinking, Creative Problem Solving, Time Management & Productivity, Cross-Cultural Communication, Project Management (PMP), Agile & Scrum, SAFe (Scaled Agile), PRINCE2, Six Sigma, Lean Management, Risk Management, Talent Acquisition & Recruitment, Learning & Development, Employee Engagement, Diversity Equity & Inclusion (DEI), HR Analytics, Compensation & Benefits, Organizational Development, Sales Training, Digital Marketing, Content Marketing & SEO, Social Media Marketing, Customer Relationship Management, Account Management, Brand Strategy, Financial Modelling, Risk & Compliance, Anti-Money Laundering (AML), GDPR & Data Privacy, Corporate Governance, Internal Audit, ESG & Sustainability, Healthcare & Life Sciences, Manufacturing & Supply Chain, ITIL & IT Service Management, Telecommunications, Banking & Financial Services, Retail & E-commerce, Design Thinking, UX/UI Design, Product Management, Innovation Management, Software Testing & QA, Automation Testing (Selenium), API Testing
- For dates use YYYY-MM-DD format
- For numeric fields, return numbers not strings
- If a field is not found in the resume, leave it as empty string, null, or empty array as appropriate
- For bio, write a concise professional summary based on the resume content
- Extract ALL certifications found

Resume text:
`;

async function extractPdfText(buffer: Buffer): Promise<string> {
  const data = new Uint8Array(buffer);
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items
      .filter((item) => "str" in item)
      .map((item) => (item as { str: string }).str);
    pages.push(strings.join(" "));
  }

  return pages.join("\n");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "No resume file provided" },
        { status: 400 }
      );
    }

    // Extract text based on file type
    let text = "";
    const buffer = Buffer.from(await file.arrayBuffer());

    if (
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf")
    ) {
      text = await extractPdfText(buffer);
    } else if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.toLowerCase().endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (
      file.type === "text/plain" ||
      file.name.toLowerCase().endsWith(".txt")
    ) {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF, DOCX, or TXT." },
        { status: 400 }
      );
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from the file. Please try a different format." },
        { status: 400 }
      );
    }

    // Use DeepSeek via OpenRouter to extract structured data
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324:free",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: EXTRACTION_PROMPT + text,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("OpenRouter error:", errBody);
      throw new Error("AI extraction failed");
    }

    const result = await response.json();
    const responseText = result.choices?.[0]?.message?.content || "";

    // Parse the JSON response (strip markdown fences if present)
    const jsonStr = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    return NextResponse.json({ data: parsed });
  } catch (err) {
    console.error("Resume parse error:", err);
    return NextResponse.json(
      { error: "Failed to parse resume. Please try again or fill in manually." },
      { status: 500 }
    );
  }
}
