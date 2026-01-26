import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
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
import { Card, CardContent } from "../Components/ui/Card"; // ✅ use local import
import Axios from "../Utils/Axios";
import SummaryApi from "../Common/SummaryApi";
import toast from "react-hot-toast";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0", "#FF69B4"];

function StatsPage() {
  const user = useSelector((state) => state.auth.userData);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const apiConfig =
          user.role === "student" ? SummaryApi.studentStats : SummaryApi.teacherStats;

        const res = await Axios({
          ...apiConfig,
          url: `${apiConfig.url}/${user._id}`, // ✅ include id param
        });

        console.log(res)

        if (res.data.success) {
          setStats(res.data.data);
        } else {
          toast.error("Failed to fetch stats");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching stats");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <p className="text-center mt-6">Loading...</p>;
  if (!stats) return <p className="text-center mt-6">No stats available</p>;

  // Pick the right data depending on role
  const pieData =
    user.role === "student"
      ? stats.doubtsBySubject.map((d) => ({
        subject: d.subject,
        count: d.total,
      }))
      : stats.answeredBySubject.map((d) => ({
        subject: d.subject,
        count: d.answered,
      }));

  const pendingPieData =
    user.role === "student"
      ? stats.doubtsBySubject.map((d) => ({
        subject: d.subject,
        count: d.pending,
      }))
      : stats.pendingBySubject.map((d) => ({
        subject: d.subject,
        count: d.pending,
      }));

  return (
    <div className="max-w-5xl mx-auto mt-8 p-4">
      <h2 className="text-2xl font-bold text-center mb-6">
        {user.role === "student" ? "📊 Student Statistics" : "📊 Teacher Statistics"}
      </h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="bg-blue-100 shadow-md">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-semibold">
              Total {user.role === "student" ? "Doubts" : "Answers"}
            </p>
            <p className="text-2xl font-bold">
              {user.role === "student" ? stats.totalDoubts : stats.totalAnswered}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-100 shadow-md">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-semibold">Pending</p>
            <p className="text-2xl font-bold">
              {user.role === "student" ? stats.pendingDoubts : stats.totalUnanswered}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart for Answered/Total */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-center mb-3">
              {user.role === "student" ? "Total Doubts by Subject" : "Answered by Subject"}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="count"
                  nameKey="subject"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                  activeIndex={-1}
                  activeShape={null}
                  stroke="none"
                  focusable={false}
                  isAnimationActive={false}
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="none"
                      focusable={false}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart for Pending */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-center mb-3">
              Pending by Subject
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pendingPieData}
                  dataKey="count"
                  nameKey="subject"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                  activeIndex={-1}
                  activeShape={null}
                  stroke="none"
                  focusable={false}
                  isAnimationActive={false}
                >
                  {pendingPieData.map((_, index) => (
                    <Cell
                      key={`cell-pending-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="none"
                      focusable={false}
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

export default StatsPage;
