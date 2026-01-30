import axios from "axios";

async function testLogin() {
  const API = "http://localhost:3000";

  console.log("Testing Login Credentials...\n");

  // Test Teacher
  console.log("1. Testing Teacher Login (EMP101)");
  try {
    const res = await axios.post(`${API}/api/auth/login`, {
      loginId: "EMP101",
      password: "password123",
    });
    console.log("   ✅ SUCCESS - Token received");
    console.log(`   Role: ${res.data.role}\n`);
  } catch (err) {
    console.log(
      `   ❌ FAILED: ${err.response?.status} - ${err.response?.data?.message}\n`,
    );
  }

  // Test Student
  console.log("2. Testing Student Login (CSE21A001)");
  try {
    const res = await axios.post(`${API}/api/auth/login`, {
      loginId: "CSE21A001",
      password: "password123",
    });
    console.log("   ✅ SUCCESS - Token received");
    console.log(`   Role: ${res.data.role}\n`);
  } catch (err) {
    console.log(
      `   ❌ FAILED: ${err.response?.status} - ${err.response?.data?.message}\n`,
    );
  }
}

testLogin();
