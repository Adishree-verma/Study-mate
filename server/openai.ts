import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantResponse {
  answer: string;
  sources: Array<{ title: string; url: string }>;
}

export async function answerStudentQuestion(
  question: string,
  history: ChatMessage[]
): Promise<AssistantResponse> {
  const systemPrompt = `You are a knowledgeable and friendly AI study assistant for competitive exam students preparing for JEE, NEET, Board exams, and Kota coaching.

Your role:
- Explain concepts clearly and step-by-step with examples
- Solve problems showing complete working
- Cover Physics, Chemistry, Mathematics, Biology, and general study topics
- Give exam tips, mnemonics, and study strategies
- Recommend reliable resources (NCERT, HC Verma, RD Sharma, etc.)

Formatting rules:
- Use numbered steps for problem solving
- Use bullet points for lists
- Use **bold** for key terms and important points
- Show formulas clearly
- Be encouraging and supportive

Always give thorough, accurate, exam-relevant answers.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      ...history.slice(-10).map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: question },
    ],
    max_tokens: 2000,
  });

  const answer = response.choices[0].message.content || "I couldn't generate an answer. Please try again.";

  const sources: Array<{ title: string; url: string }> = [];
  const q = question.toLowerCase();

  if (q.includes("physics") || q.includes("newton") || q.includes("motion") || q.includes("force") || q.includes("energy") || q.includes("wave") || q.includes("optic") || q.includes("electric") || q.includes("magnetic")) {
    sources.push({ title: "NCERT Physics Textbook", url: "https://ncert.nic.in/textbook.php" });
    sources.push({ title: "HC Verma Concepts", url: "https://www.hcverma.in" });
  }
  if (q.includes("chemistry") || q.includes("organic") || q.includes("reaction") || q.includes("element") || q.includes("atom") || q.includes("bond") || q.includes("acid") || q.includes("base") || q.includes("mole")) {
    sources.push({ title: "NCERT Chemistry Textbook", url: "https://ncert.nic.in/textbook.php" });
    sources.push({ title: "JD Lee Inorganic Chemistry", url: "https://www.amazon.in/Concise-Inorganic-Chemistry-J-Lee/dp/8126515678" });
  }
  if (q.includes("math") || q.includes("calculus") || q.includes("algebra") || q.includes("trigon") || q.includes("equation") || q.includes("integral") || q.includes("derivative") || q.includes("limit") || q.includes("matrix") || q.includes("vector")) {
    sources.push({ title: "NCERT Mathematics Textbook", url: "https://ncert.nic.in/textbook.php" });
    sources.push({ title: "RD Sharma Mathematics", url: "https://www.rdsharmamaths.com" });
  }
  if (q.includes("biology") || q.includes("cell") || q.includes("mitosis") || q.includes("dna") || q.includes("gene") || q.includes("plant") || q.includes("animal") || q.includes("neet")) {
    sources.push({ title: "NCERT Biology Textbook", url: "https://ncert.nic.in/textbook.php" });
    sources.push({ title: "Trueman's Biology", url: "https://www.amazon.in/s?k=truemans+biology" });
  }
  if (q.includes("jee") || q.includes("exam") || q.includes("strategy") || q.includes("study") || q.includes("tip") || q.includes("schedule") || q.includes("revision")) {
    sources.push({ title: "JEE Main Official Portal", url: "https://jeemain.nta.nic.in" });
    sources.push({ title: "Khan Academy (Free Study)", url: "https://www.khanacademy.org" });
  }
  if (sources.length === 0) {
    sources.push({ title: "Khan Academy", url: "https://www.khanacademy.org" });
    sources.push({ title: "NCERT Textbooks", url: "https://ncert.nic.in/textbook.php" });
  }

  return { answer, sources };
}

interface Subject {
  name: string;
  targetHours: number;
}

interface ScheduleRequest {
  subjects: Subject[];
  examDate: string;
  dailyStudyHours: number;
  additionalInfo?: string;
}

export async function generateStudySchedule(request: ScheduleRequest): Promise<string> {
  const { subjects, examDate, dailyStudyHours, additionalInfo } = request;
  const subjectsList = subjects.map(s => `${s.name} (${s.targetHours}h/week target)`).join(", ");

  const prompt = `You are an expert study planner for competitive exam preparation (like JEE/NEET for Kota students).

Generate a detailed weekly study schedule with the following constraints:
- Subjects to cover: ${subjectsList}
- Main exam date: ${examDate}
- Daily study hours available: ${dailyStudyHours} hours
${additionalInfo ? `- Student preferences: ${additionalInfo}` : ""}

Please create a structured weekly schedule that:
1. Distributes study time across all subjects based on their target hours
2. Includes regular breaks and revision sessions
3. Uses spaced repetition principles (review topics at increasing intervals)
4. Allocates more time to high-priority subjects
5. Includes time for practice problems and mock tests
6. Follows proven study techniques for exam preparation

Format the schedule day by day (Monday to Sunday) with specific time blocks and subjects. Make it practical and achievable.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert study planner specializing in competitive exam preparation for JEE and NEET students. Create realistic, effective study schedules."
      },
      { role: "user", content: prompt }
    ],
    max_tokens: 2048,
  });

  return response.choices[0].message.content || "Failed to generate schedule";
}
