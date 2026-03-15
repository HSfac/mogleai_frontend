'use client';

import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ChartData {
  date: string;
  users?: number;
  revenue?: number;
  conversations?: number;
}

interface DashboardChartsProps {
  chartData?: ChartData[];
}

// 더미 데이터 (API 연결 전)
const generateDummyData = (): ChartData[] => {
  const data: ChartData[] = [];
  const today = new Date();

  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      users: Math.floor(Math.random() * 50) + 10,
      revenue: Math.floor(Math.random() * 500000) + 100000,
      conversations: Math.floor(Math.random() * 1000) + 200,
    });
  }

  return data;
};

const cardStyle = {
  bgcolor: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 3,
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: '#2a2a2a',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 1,
          p: 1.5,
        }}
      >
        <Typography variant="body2" color="#fff" fontWeight={600}>
          {label}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Typography
            key={index}
            variant="body2"
            sx={{ color: entry.color }}
          >
            {entry.name}: {entry.name === '매출'
              ? `₩${entry.value.toLocaleString()}`
              : entry.value.toLocaleString()}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

export default function DashboardCharts({ chartData }: DashboardChartsProps) {
  const data = chartData || generateDummyData();

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* 매출 추이 차트 */}
      <Grid item xs={12} md={6}>
        <Card sx={cardStyle}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} color="#fff" gutterBottom>
              매출 추이 (14일)
            </Typography>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="date"
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="매출"
                    stroke="#ff5e62"
                    strokeWidth={2}
                    dot={{ fill: '#ff5e62', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: '#ff5e62' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* 사용자 증가 차트 */}
      <Grid item xs={12} md={6}>
        <Card sx={cardStyle}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} color="#fff" gutterBottom>
              신규 사용자 (14일)
            </Typography>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="date"
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="users"
                    name="신규 사용자"
                    stroke="#2196f3"
                    strokeWidth={2}
                    dot={{ fill: '#2196f3', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: '#2196f3' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* 대화량 차트 */}
      <Grid item xs={12}>
        <Card sx={cardStyle}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} color="#fff" gutterBottom>
              일별 대화량 (14일)
            </Typography>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="date"
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="conversations"
                    name="대화 수"
                    fill="#9c27b0"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
