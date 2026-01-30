import axios from "axios";

const API = "http://localhost:3000";

async function testStudentAI() {
  try {
    console.log("Testing Student Dashboard with AI Integration\n");

    // Login
    const loginRes = await axios.post(`${API}/api/auth/login`, {
      loginId: "CSE21A001",
      password: "password123",
    });

    const token = loginRes.data.token;
    console.log("✅  Logged in as student\n");

    // Get dashboard
    const dashRes = await axios.get(`${API}/api/student/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("📊 Dashboard Response:");
    console.log(`   Student: ${dashRes.data.student?.name}`);
    console.log(
      `   Attendance: ${dashRes.data.metrics?.attendance?.percentage}%`,
    );
    console.log("\n🤖 AI Risk Assessment:");
    console.log(`   Level: ${dashRes.data.metrics?.risk?.level}`);
    console.log(`   Score: ${dashRes.data.metrics?.risk?.score}`);
    console.log(`   Factors:`);
    dashRes.data.metrics?.risk?.factors?.forEach((f) =>
      console.log(`     - ${f}`),
    );

    if (dashRes.data.metrics?.risk?.level !== "Unknown") {
      console.log("\n✅ AI service is working!");
    } else {
      console.log(
        "\n⚠️  AI returned Unknown - service may be down (fallback working)",
      );
    }
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

testStudentAI();
