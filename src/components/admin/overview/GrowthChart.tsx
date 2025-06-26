
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

interface ChartData {
  date: string;
  subscribers: number;
  messages: number;
  campaigns: number;
  revenue: number;
}

interface GrowthChartProps {
  data: ChartData[];
}

const GrowthChart: React.FC<GrowthChartProps> = ({ data }) => {
  const chartConfig = {
    subscribers: {
      label: "Subscribers",
      color: "hsl(var(--primary))",
    },
    campaigns: {
      label: "Campaigns",
      color: "hsl(142.1 76.2% 36.3%)",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Growth Metrics</CardTitle>
        <CardDescription>Daily activity over the last week</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="subscribers" 
                stroke="var(--color-subscribers)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-subscribers)" }}
              />
              <Line 
                type="monotone" 
                dataKey="campaigns" 
                stroke="var(--color-campaigns)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-campaigns)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default GrowthChart;
