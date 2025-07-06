import React, { useState, useEffect } from 'react';
import { ChartBarIcon, UsersIcon, BriefcaseIcon, BuildingStorefrontIcon, CalendarIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import axiosInstance from '../../api/axiosInstance';

// Chart for Applications by Domain
const DomainBarChart = ({ data }) => (
  <div className="card p-6 h-80">
    <h3 className="text-lg font-semibold text-text-primary mb-4">Applications by Domain</h3>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis dataKey="domain" angle={-45} textAnchor="end" stroke="#A0AEC0" tick={{ fontSize: 12 }} />
        <YAxis stroke="#A0AEC0" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: '#F5F5F7'
          }}
          cursor={{ fill: 'rgba(138, 79, 255, 0.1)' }}
        />
        <Bar dataKey="count" name="Applications" fill="#8A4FFF" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// Chart for Platform Growth
const PlatformGrowthChart = ({ data, days }) => (
  <div className="card p-6 h-80">
    <h3 className="text-lg font-semibold text-text-primary mb-4">Platform Growth (Last {days} Days)</h3>
    <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="date" stroke="#A0AEC0" tick={{ fontSize: 12 }} />
            <YAxis stroke="#A0AEC0" />
            <Tooltip
                contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#F5F5F7'
                }}
                cursor={{ stroke: '#8A4FFF', strokeWidth: 1 }}
            />
            <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
            <Line type="monotone" dataKey="userSignups" name="New Users" stroke="#8A4FFF" strokeWidth={2} />
            <Line type="monotone" dataKey="internshipsPosted" name="New Internships" stroke="#4FEFFF" strokeWidth={2} />
        </LineChart>
    </ResponsiveContainer>
  </div>
);

// Chart for Application Status
const ApplicationStatusChart = ({ data }) => {
  const COLORS = ['#8A4FFF', '#4FEFFF', '#FF6B6B', '#4ECDC4', '#45B7D1'];
  
  return (
    <div className="card p-6 h-80">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Application Status Breakdown</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(30, 41, 59, 0.9)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#F5F5F7'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function AnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [domainStats, setDomainStats] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [popularInternships, setPopularInternships] = useState([]);
  const [statusStats, setStatusStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState(30);

  // State for dynamic filter options
  const [domainOptions, setDomainOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [cgpaOptions, setCgpaOptions] = useState([]); // Will be populated from API

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError('');
      try {
        const [summaryRes, domainRes, growthRes, popularRes, statusRes] = await Promise.all([
          axiosInstance.get('/analytics/summary'),
          axiosInstance.get('/analytics/domain-stats'),
          axiosInstance.get(`/analytics/platform-growth?days=${dateRange}`),
          axiosInstance.get('/analytics/popular-internships'),
          axiosInstance.get('/analytics/application-status')
        ]);

        setSummary(summaryRes.data);
        setDomainStats(domainRes.data);
        setPopularInternships(popularRes.data);
        setStatusStats(statusRes.data);

        // Process growth data to merge user and internship counts by date
        const processedGrowth = {};
        growthRes.data.userGrowth.forEach(item => {
            processedGrowth[item.date] = { ...processedGrowth[item.date], date: item.date, userSignups: item.userSignups };
        });
        growthRes.data.internshipGrowth.forEach(item => {
            processedGrowth[item.date] = { ...processedGrowth[item.date], date: item.date, internshipsPosted: item.internshipsPosted };
        });
        setGrowthData(Object.values(processedGrowth).sort((a, b) => new Date(a.date) - new Date(b.date)));

      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [dateRange]);

  // Export functionality
  const exportToCSV = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Create comprehensive CSV data
    const csvData = [
      ['InternHub Analytics Report'],
      [`Generated on: ${currentDate}`],
      [`Date Range: Last ${dateRange} days`],
      [''],
      
      // Summary Statistics
      ['SUMMARY STATISTICS'],
      ['Metric', 'Value'],
      ['Total Internships', summary?.totalInternships || 0],
      ['Total Applications', summary?.totalApplications || 0],
      ['Total Users', summary?.totalUsers || 0],
      ['Unique Companies', summary?.uniqueCompanies || 0],
      [''],
      
      // Domain Statistics
      ['DOMAIN STATISTICS'],
      ['Domain', 'Number of Internships'],
      ...domainStats.map(item => [item.domain, item.count]),
      [''],
      
      // Application Status Breakdown
      ['APPLICATION STATUS BREAKDOWN'],
      ['Status', 'Count', 'Percentage'],
      ...statusStats.map(item => [
        item.status, 
        item.count, 
        `${Math.round((item.count / summary?.totalApplications) * 100)}%`
      ]),
      [''],
      
      // Popular Internships
      ['TOP POPULAR INTERNSHIPS'],
      ['Title', 'Company', 'Application Count'],
      ...popularInternships.map(item => [item.title, item.companyName, item.applicationCount]),
      [''],
      
      // Growth Data
      ['PLATFORM GROWTH DATA'],
      ['Date', 'New Users', 'New Internships Posted'],
      ...growthData.map(item => [
        item.date, 
        item.userSignups || 0, 
        item.internshipsPosted || 0
      ]),
      [''],
      
      // Quick Insights
      ['QUICK INSIGHTS'],
      ['Insight', 'Value'],
      ['Most Popular Domain', domainStats.length > 0 ? domainStats[0].domain : 'No data'],
      ['Application Success Rate', statusStats.length > 0 ? 
        `${Math.round((statusStats.find(s => s.status === 'accepted')?.count || 0) / summary?.totalApplications * 100)}%` : 
        'No data'],
      ['Growth Trend', growthData.length > 1 ? 
        (growthData[growthData.length - 1].userSignups > growthData[0].userSignups ? 'Increasing' : 'Decreasing') : 
        'No trend data'],
      ['Average Applications per Internship', summary?.totalInternships > 0 ? 
        Math.round(summary?.totalApplications / summary?.totalInternships) : 0]
    ];

    // Convert to CSV format with proper escaping
    const csvContent = csvData.map(row => 
      row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const escaped = String(cell).replace(/"/g, '""');
        if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
          return `"${escaped}"`;
        }
        return escaped;
      }).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `internhub-analytics-${currentDate}-${dateRange}days.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner message="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage title="Could not load data" message={error} />;
  }
  
  const statCards = [
    { name: 'Total Internships', stat: summary?.totalInternships || 0, icon: BriefcaseIcon },
    { name: 'Total Applications', stat: summary?.totalApplications || 0, icon: UsersIcon },
    { name: 'Total Users', stat: summary?.totalUsers || 0, icon: UsersIcon },
    { name: 'Unique Companies', stat: summary?.uniqueCompanies || 0, icon: BuildingStorefrontIcon },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary flex items-center">
              <ChartBarIcon className="h-8 w-8 mr-3 text-brand-primary" />
              Platform Analytics
            </h1>
            <p className="mt-2 text-text-secondary">
              An overview of internship and user engagement metrics.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
            {/* Date Range Selector */}
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-text-secondary" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(parseInt(e.target.value))}
                className="bg-brand-surface border border-border-color rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
            {/* Export Button */}
            <button
              onClick={exportToCSV}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <DocumentArrowDownIcon className="h-5 w-5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stat Cards */}
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <div key={item.name} className="relative card card-hover-glow p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-brand-primary/20">
                <item.icon className="h-6 w-6 text-brand-primary" aria-hidden="true" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary truncate">{item.name}</p>
                <p className="text-2xl font-semibold text-text-primary">{item.stat}</p>
              </div>
            </div>
          </div>
        ))}
      </dl>

      {/* Charts Section */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Engagement Charts</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <DomainBarChart data={domainStats} />
          <PlatformGrowthChart data={growthData} days={dateRange} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ApplicationStatusChart data={statusStats.map(s => ({ ...s, name: s.status }))} />
          <div className="card p-6 h-80">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Insights</h3>
            <div className="space-y-4 h-64 overflow-y-auto pr-2 custom-scrollbar">
              <div className="p-4 bg-brand-primary/10 rounded-lg border border-brand-primary/20">
                <h4 className="font-semibold text-brand-primary mb-2">Most Popular Domain</h4>
                <p className="text-text-secondary">
                  {domainStats.length > 0 ? domainStats[0].domain : 'No data available'}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {domainStats.length > 0 ? `${domainStats[0].count} internships` : ''}
                </p>
              </div>
              
              <div className="p-4 bg-brand-accent/10 rounded-lg border border-brand-accent/20">
                <h4 className="font-semibold text-brand-accent mb-2">Application Success Rate</h4>
                <p className="text-text-secondary">
                  {statusStats.length > 0 ? 
                    `${Math.round((statusStats.find(s => s.status === 'accepted')?.count || 0) / summary?.totalApplications * 100)}%` : 
                    'No data available'}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {statusStats.find(s => s.status === 'accepted')?.count || 0} accepted out of {summary?.totalApplications || 0} total
                </p>
              </div>
              
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <h4 className="font-semibold text-green-500 mb-2">Growth Trend</h4>
                <p className="text-text-secondary">
                  {growthData.length > 1 ? 
                    (growthData[growthData.length - 1].userSignups > growthData[0].userSignups ? '📈 Increasing' : '📉 Decreasing') : 
                    'No trend data'}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {growthData.length > 1 ? 
                    `From ${growthData[0].userSignups || 0} to ${growthData[growthData.length - 1].userSignups || 0} users` : 
                    ''}
                </p>
              </div>
              
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <h4 className="font-semibold text-purple-500 mb-2">Average Applications/Internship</h4>
                <p className="text-text-secondary">
                  {summary?.totalInternships > 0 ? 
                    Math.round(summary?.totalApplications / summary?.totalInternships) : 0}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {summary?.totalApplications || 0} total applications
                </p>
              </div>
              
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <h4 className="font-semibold text-blue-500 mb-2">Top Company</h4>
                <p className="text-text-secondary">
                  {popularInternships.length > 0 ? popularInternships[0].companyName : 'No data available'}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {popularInternships.length > 0 ? `${popularInternships[0].applicationCount} applications` : ''}
                </p>
              </div>
              
              <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <h4 className="font-semibold text-orange-500 mb-2">Platform Activity</h4>
                <p className="text-text-secondary">
                  {growthData.length > 0 ? 
                    `${growthData.reduce((sum, item) => sum + (item.internshipsPosted || 0), 0)} new internships` : 
                    'No data available'}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {growthData.length > 0 ? 
                    `${growthData.reduce((sum, item) => sum + (item.userSignups || 0), 0)} new users` : 
                    ''}
                </p>
              </div>
              
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <h4 className="font-semibold text-red-500 mb-2">Pending Applications</h4>
                <p className="text-text-secondary">
                  {statusStats.find(s => s.status === 'pending')?.count || 0}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {statusStats.length > 0 ? 
                    `${Math.round((statusStats.find(s => s.status === 'pending')?.count || 0) / summary?.totalApplications * 100)}% of total` : 
                    ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Top 5 Popular Internships</h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-color">
              <thead className="bg-brand-dark">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Company</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Applications</th>
                </tr>
              </thead>
              <tbody className="bg-brand-surface divide-y divide-border-color">
                {popularInternships.length > 0 ? popularInternships.map((internship) => (
                  <tr key={internship.internshipId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{internship.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{internship.companyName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-accent font-semibold">{internship.applicationCount}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-text-secondary">No popular internships found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 