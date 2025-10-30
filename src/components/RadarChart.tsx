import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  courseOverlap: number;
  scheduleCompatibility: number;
  studyStyleMatch: number;
}

export const RadarChart = ({ 
  courseOverlap, 
  scheduleCompatibility, 
  studyStyleMatch 
}: RadarChartProps) => {
  const data = {
    labels: ['Courses', 'Schedule', 'Study Style'],
    datasets: [
      {
        label: 'Match Factors',
        data: [courseOverlap, scheduleCompatibility, studyStyleMatch],
        backgroundColor: 'rgba(74, 144, 226, 0.2)',
        borderColor: 'rgba(74, 144, 226, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(126, 211, 33, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(126, 211, 33, 1)',
      },
    ],
  };

  const options: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 60,
        ticks: {
          stepSize: 15,
          backdropColor: 'transparent',
          color: '#94a3b8',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.2)',
        },
        angleLines: {
          color: 'rgba(148, 163, 184, 0.25)'
        },
        pointLabels: {
          font: {
            size: 12,
            weight: 'bold',
          },
          color: '#e2e8f0',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.label}: ${context.parsed.r}`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-48">
      <Radar data={data} options={options} />
    </div>
  );
};
