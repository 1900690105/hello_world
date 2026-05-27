import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

const students = [
  {
    name: "Ram Sharma",
    email: "ram2@gmail.com",
    branch: "CSE",
    year: 4,
    phone: "9876543210",
    city: "Pune",
  },
  {
    name: "Priya Patel",
    email: "priya2@gmail.com",
    branch: "IT",
    year: 3,
    phone: "9123456780",
    city: "Mumbai",
  },
  {
    name: "Amit Verma",
    email: "amit2@gmail.com",
    branch: "Mechanical",
    year: 2,
    phone: "9988776655",
    city: "Delhi",
  },
  {
    name: "Sneha Singh",
    email: "sneha2@gmail.com",
    branch: "ECE",
    year: 4,
    phone: "8899776655",
    city: "Bangalore",
  },
  {
    name: "Rahul Jain",
    email: "rahul2@gmail.com",
    branch: "Civil",
    year: 1,
    phone: "9871234567",
    city: "Indore",
  },
];

async function seedDatabase() {
  try {
    const { data, error } = await supabase
      .from("students")
      .insert(students)
      .select();

    if (error) {
      console.error("Error inserting data:", error);
      return;
    }

    console.log("Data inserted successfully!");
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

seedDatabase();
