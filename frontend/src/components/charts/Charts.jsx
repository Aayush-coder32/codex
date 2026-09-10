import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

const tooltipStyle = { border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 8px 24px rgba(15,23,42,.08)', fontSize: 12 }
const axis = { fontSize: 11, fill: '#7b879d' }

export function TrendAreaChart({ data, dataKey = 'applications', color = '#2563eb' }) {
  return <ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}><defs><linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={.28}/><stop offset="100%" stopColor={color} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#edf1f7"/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={axis}/><YAxis axisLine={false} tickLine={false} tick={axis}/><Tooltip contentStyle={tooltipStyle}/><Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} fill={`url(#fill-${dataKey})`} /></AreaChart></ResponsiveContainer>
}

export function SkillsBarChart({ data, comparative = false }) {
  return <ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ left: -20, right: 5 }} barGap={4}><CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#edf1f7"/><XAxis dataKey="skill" tick={axis} axisLine={false} tickLine={false}/><YAxis tick={axis} axisLine={false} tickLine={false} domain={[0,100]}/><Tooltip contentStyle={tooltipStyle}/>{comparative && <Legend wrapperStyle={{ fontSize: 11 }}/>}<Bar dataKey="student" name="Student skills" fill="#2563eb" radius={[6,6,0,0]} maxBarSize={28}/>{comparative && <Bar dataKey="demand" name="Industry demand" fill="#8b5cf6" radius={[6,6,0,0]} maxBarSize={28}/>}</BarChart></ResponsiveContainer>
}

const colors = ['#2563eb','#8b5cf6','#16a34a','#f59e0b','#ec4899','#06b6d4']
export function DonutChart({ data }) { return <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} innerRadius="55%" outerRadius="82%" paddingAngle={4} dataKey="value" nameKey="name">{data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]}/>)}</Pie><Tooltip contentStyle={tooltipStyle}/><Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:11}}/></PieChart></ResponsiveContainer> }

export function SimpleLineChart({ data }) { return <ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{left:-20,right:10}}><CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#edf1f7"/><XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false}/><YAxis tick={axis} axisLine={false} tickLine={false}/><Tooltip contentStyle={tooltipStyle}/><Line type="monotone" dataKey="placements" stroke="#16a34a" strokeWidth={3} dot={{r:3,fill:'#16a34a'}}/><Line type="monotone" dataKey="students" stroke="#2563eb" strokeWidth={3} dot={false}/></LineChart></ResponsiveContainer> }
