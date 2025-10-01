import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent } from "../Components/ui/Card";
import Axios from "../Utils/Axios";
import SummaryApi from "../Common/SummaryApi";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0", "#FF69B4"];

function SchoolStatsPage() {
  const school = useSelector((state) => state.auth.userData); // ✅ logged-in school admin
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!school?.schoolId) return;

    (async () => {
      try {
        setLoading(true);

        const res = await Axios({
          ...SummaryApi.schoolStats,
          url: `${SummaryApi.schoolStats.url}/${school.schoolId}`, // ✅ pass schoolId
        });

        if (res.data.success) {
          setStats(res.data.data);
        } else {
          toast.error("Failed to fetch school statistics");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching school statistics");
      } finally {
        setLoading(false);
      }
    })();
  }, [school]);

  if (loading) return <p className="text-center mt-6">Loading...</p>;
  if (!stats) return <p className="text-center mt-6">No stats available</p>;

  const classWiseData = stats.classWise;
  const avgDoubts = (stats.totalDoubts / classWiseData.length).toFixed(2);
  const maxClass = classWiseData.reduce((max, c) =>
    c.total > max.total ? c : max
  );

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4">
      <h2 className="text-2xl font-bold text-center mb-6">
        🏫 {school.schoolName} — Statistics Dashboard
      </h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-100 shadow-md">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-semibold">Total Doubts</p>
            <p className="text-2xl font-bold">{stats.totalDoubts}</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-100 shadow-md">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-semibold">Pending Doubts</p>
            <p className="text-2xl font-bold">{stats.totalPending}</p>
          </CardContent>
        </Card>

        <Card className="bg-green-100 shadow-md">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-semibold">Avg Doubts/Class</p>
            <p className="text-2xl font-bold">{avgDoubts}</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-100 shadow-md">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-semibold">Max Doubts</p>
            <p className="text-2xl font-bold">
              Class {maxClass.class} ({maxClass.total})
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Doubts Classwise (Bar Chart) */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-center mb-3">
              Total Doubts by Class
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classWiseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="class" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pending Doubts Classwise (Pie Chart) */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-center mb-3">
              Pending Doubts by Class
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={classWiseData}
                  dataKey="pending"
                  nameKey="class"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `Class ${entry.class}`}
                >
                  {classWiseData.map((_, index) => (
                    <Cell
                      key={`cell-pending-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SchoolStatsPage;
