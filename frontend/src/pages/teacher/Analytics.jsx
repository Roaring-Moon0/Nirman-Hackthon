import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../utils/constants';
import { TrendingUp, AlertCircle, Users, Activity } from 'lucide-react';

const TeacherAnalytics = () => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    // Fetch dashboard data for analytics aggregation
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/teacher/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Calculate aggregates
                const classes = res.data.classes || [];
                const totalStudents = classes.reduce((sum, c) => sum + c.totalStudents, 0);
                const totalHighRisk = classes.reduce((sum, c) => sum + c.riskSummary.highRisk, 0);
                const totalMediumRisk = classes.reduce((sum, c) => sum + c.riskSummary.mediumRisk, 0);
                const totalLowRisk = classes.reduce((sum, c) => sum + c.riskSummary.lowRisk, 0);

                setStats({
                    totalStudents,
                    riskDist: { high: totalHighRisk, medium: totalMediumRisk, low: totalLowRisk },
                    classes
                });
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchData();
    }, [token]);

    if (loading) return <div className="p-8 text-center">Loading analytics...</div>;

    const { riskDist, totalStudents, classes } = stats;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Class Performance Analytics</h1>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="text-blue-500" />
                        <h3 className="font-semibold text-gray-700">Total Students</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
                </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <Activity className="text-purple-500" />
                        <h3 className="font-semibold text-gray-700">Avg Attendance</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">84%</p>
                    <p className="text-xs text-green-600 font-medium">+2% vs last month</p>
                </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="text-red-500" />
                        <h3 className="font-semibold text-gray-700">At-Risk Students</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{riskDist.high}</p>
                    <p className="text-xs text-red-500 font-medium">Needs attention</p>
                </div>
            </div>

            {/* Risk Distribution Chart (CSS Grid Bar) */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Overall Risk Distribution</h2>
                
                <div className="flex h-12 rounded-xl overflow-hidden mb-4">
                    <div style={{ width: `${(riskDist.low / totalStudents) * 100}%` }} className="bg-green-500 h-full flex items-center justify-center text-white font-bold text-sm">
                        {(riskDist.low / totalStudents * 100).toFixed(0)}%
                    </div>
                    <div style={{ width: `${(riskDist.medium / totalStudents) * 100}%` }} className="bg-yellow-400 h-full flex items-center justify-center text-white font-bold text-sm">
                        {(riskDist.medium / totalStudents * 100).toFixed(0)}%
                    </div>
                     <div style={{ width: `${(riskDist.high / totalStudents) * 100}%` }} className="bg-red-500 h-full flex items-center justify-center text-white font-bold text-sm">
                        {(riskDist.high / totalStudents * 100).toFixed(0)}%
                    </div>
                </div>
                
                <div className="flex gap-8 justify-center">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Low Risk (Safe)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">Medium Risk (Monitor)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">High Risk (Action Needed)</span>
                    </div>
                </div>
            </div>

             {/* Class Comparison */}
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                 <h2 className="text-lg font-bold text-gray-900 mb-6">Class Comparison</h2>
                 <div className="space-y-6">
                     {classes.map((c, i) => (
                         <div key={i}>
                             <div className="flex justify-between text-sm font-medium mb-1">
                                 <span>{c.class.classCode} - {c.subject.subjectName}</span>
                                 <span>{c.riskSummary.highRisk} At-Risk</span>
                             </div>
                             <div className="w-full bg-gray-100 rounded-full h-2.5">
                                 <div 
                                    className="bg-purple-600 h-2.5 rounded-full" 
                                    style={{ width: `${(1 - (c.riskSummary.highRisk / c.totalStudents)) * 100}%` }}
                                 ></div>
                             </div>
                             <p className="text-xs text-gray-400 mt-1 text-right">Health Score</p>
                         </div>
                     ))}
                 </div>
             </div>
        </div>
    );
};

export default TeacherAnalytics;
