// Imagens e vídeos em public/ para Next.js
const logoUrl = '/images/logo.png';
const demoTechVideo = '/demo-tech.mp4';
const demoCreativeVideo = '/demo-creative.mp4';
import type { ProfileData, VideoItem } from '@/data/mockProfiles';

const techPortfolio: VideoItem[] = [
  {
    id: 'demo-v1',
    title: 'Demo Reel — Produto & Engenharia',
    description: 'Pequeno vídeo de demonstração (exemplo de portfólio).',
    youtubeId: 'jNQXAC9IVRw',
    duration: '0:19',
    price: 5,
    category: 'Showreel',
  },
];

const creativePortfolio: VideoItem[] = [
  {
    id: 'demo-v2',
    title: 'Demo Reel — Motion & Edição',
    description: 'Exemplo de vídeo para mostrar trabalhos criativos.',
    youtubeId: 'LXb3EKWsInQ',
    duration: '2:30',
    price: 5,
    category: 'Motion',
  },
];

export const demoProfiles: ProfileData[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'technova-labs',
    name: 'TechNova Labs',
    title: 'Empresa de Tecnologia (Demo)',
    location: 'São Paulo, BR',
    photo: logoUrl,
    bio: 'Construímos produtos digitais com foco em performance, design e escala. (Perfil de demonstração)',
    skills: ['React', 'TypeScript', 'Node.js', 'Cloud', 'Product'],
    links: [
      { label: 'Website', url: 'https://example.com', icon: 'globe' },
      { label: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin' },
    ],
    experience: [
      {
        role: 'Time de Produto',
        company: 'TechNova Labs',
        period: '2022 – Presente',
        description: 'Squads multidisciplinares entregando features com alta qualidade. (Demo)',
      },
    ],
    education: [],
    contact: {
      email: 'contato@technova.demo',
      phone: '+55 11 99999-0000',
      linkedin: 'linkedin.com/company/technova',
    },
    videoPortfolio: techPortfolio,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    slug: 'aurora-studio',
    name: 'Aurora Creative Studio',
    title: 'Estúdio Criativo (Demo)',
    location: 'Rio de Janeiro, BR',
    photo: logoUrl,
    bio: 'Conteúdo, vídeo e identidade de marca para startups e creators. (Perfil de demonstração)',
    skills: ['Branding', 'Motion', 'Video', 'Design', 'Social'],
    links: [
      { label: 'Portfolio', url: 'https://example.com', icon: 'globe' },
      { label: 'Instagram', url: 'https://instagram.com', icon: 'camera' },
    ],
    experience: [
      {
        role: 'Produção Criativa',
        company: 'Aurora Studio',
        period: '2021 – Presente',
        description: 'Campanhas e vídeos curtos com motion e edição. (Demo)',
      },
    ],
    education: [],
    contact: {
      email: 'hello@aurora.demo',
      phone: '+55 21 98888-1111',
      linkedin: 'linkedin.com/company/aurora-studio',
    },
    videoPortfolio: creativePortfolio,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    slug: 'joao-frontend-demo',
    name: 'João Frontend',
    title: 'Frontend Engineer',
    location: 'Curitiba, BR',
    photo: logoUrl,
    bio: 'Frontend com foco em interfaces rápidas, acessíveis e bem testadas. (Perfil de demonstração)',
    skills: ['React', 'TypeScript', 'Accessibility', 'Vitest'],
    links: [
      { label: 'GitHub', url: 'https://github.com', icon: 'github' },
      { label: 'Portfolio', url: 'https://example.com', icon: 'globe' },
    ],
    experience: [
      {
        role: 'Frontend Engineer',
        company: 'TechNova Labs',
        period: '2023 – Presente',
        description: 'Componentização, performance e acessibilidade em produção. (Demo)',
      },
    ],
    education: [
      { degree: 'Bacharelado em Sistemas', school: 'Universidade (Demo)', year: '2022' },
    ],
    contact: {
      email: 'joao@demo.dev',
      phone: '+55 41 90000-2222',
      linkedin: 'linkedin.com/in/joao-frontend',
    },
    videoPortfolio: techPortfolio,
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    slug: 'marina-product-demo',
    name: 'Marina Product',
    title: 'Product Designer',
    location: 'Belo Horizonte, BR',
    photo: logoUrl,
    bio: 'Design de produto orientado a métricas e colaboração com engenharia. (Perfil de demonstração)',
    skills: ['Figma', 'Prototyping', 'Design Systems', 'UX'],
    links: [
      { label: 'Behance', url: 'https://behance.net', icon: 'globe' },
      { label: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin' },
    ],
    experience: [
      {
        role: 'Product Designer',
        company: 'Aurora Studio',
        period: '2022 – Presente',
        description: 'Sistemas de design e fluxos críticos para produtos digitais. (Demo)',
      },
    ],
    education: [
      { degree: 'B.A. Design', school: 'Instituição (Demo)', year: '2021' },
    ],
    contact: {
      email: 'marina@demo.design',
      phone: '+55 31 95555-3333',
      linkedin: 'linkedin.com/in/marina-product',
    },
    videoPortfolio: creativePortfolio,
  },
];

export type DemoDirectoryProfile = {
  id: string;
  slug: string;
  name: string;
  title: string | null;
  location: string | null;
  photo_url: string | null;
  bio: string | null;
  skills: string[] | null;
  user_type: string;
  boost_score: number;
  homepage_until: string | null;
  isDemo?: boolean;
};

export const demoDirectoryProfiles: DemoDirectoryProfile[] = demoProfiles.map((p) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  title: p.title,
  location: p.location,
  photo_url: p.photo,
  bio: p.bio,
  skills: p.skills,
  user_type: p.slug.includes('studio') || p.slug.includes('technova') ? 'company' : 'seeker',
  boost_score: 0,
  homepage_until: null,
  isDemo: true,
}));

export type DemoVideoProfile = {
  id: string;
  name: string;
  title: string | null;
  photo_url: string | null;
  video_url: string;
  slug: string;
  location: string | null;
  boost_score: number;
  homepage_until: string | null;
  user_type: string;
  isDemo?: boolean;
};

export const demoVideoProfiles: DemoVideoProfile[] = [
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'TechNova Labs',
    title: 'Empresa de Tecnologia (Demo)',
    photo_url: logoUrl,
    video_url: demoTechVideo,
    slug: 'technova-labs',
    location: 'São Paulo, BR',
    boost_score: 0,
    homepage_until: null,
    user_type: 'company',
    isDemo: true,
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    name: 'Aurora Creative Studio',
    title: 'Estúdio Criativo (Demo)',
    photo_url: logoUrl,
    video_url: demoCreativeVideo,
    slug: 'aurora-studio',
    location: 'Rio de Janeiro, BR',
    boost_score: 0,
    homepage_until: null,
    user_type: 'company',
    isDemo: true,
  },
];

export type DemoJob = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  job_type: string | null;
  salary_range: string | null;
  skills: string[] | null;
  created_at: string;
  isDemo?: boolean;
};

export const demoJobs: DemoJob[] = [
  {
    id: 'job-demo-1',
    title: 'Frontend Developer (React) — Sênior',
    description: 'Atue em squads com foco em performance e DX. (Vaga de demonstração)',
    location: 'Remoto (Brasil)',
    job_type: 'full-time',
    salary_range: 'R$ 14k – 22k',
    skills: ['React', 'TypeScript', 'Tailwind', 'Testing'],
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    isDemo: true,
  },
  {
    id: 'job-demo-2',
    title: 'Product Designer — Pleno',
    description: 'Design de produto ponta a ponta, com forte colaboração com engenharia. (Vaga de demonstração)',
    location: 'São Paulo, BR',
    job_type: 'full-time',
    salary_range: 'R$ 10k – 16k',
    skills: ['Figma', 'Design Systems', 'UX Research'],
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    isDemo: true,
  },
  {
    id: 'job-demo-3',
    title: 'Motion Designer — Júnior',
    description: 'Aberturas, lower thirds e animações para social. (Vaga de demonstração)',
    location: 'Rio de Janeiro, BR',
    job_type: 'part-time',
    salary_range: 'R$ 4k – 7k',
    skills: ['After Effects', 'Motion', 'Branding'],
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    isDemo: true,
  },
];
