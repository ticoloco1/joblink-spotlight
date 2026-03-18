export interface VideoItem {
  id: string;
  title: string;
  description: string;
  youtubeId: string; // YouTube video ID for embed
  thumbnail?: string; // optional custom thumbnail, defaults to YouTube thumbnail
  duration: string;
  price: number; // in credits
  category: string;
}

export interface ProfileData {
  id: string;
  slug: string;
  name: string;
  title: string;
  location: string;
  photo: string;
  bio: string;
  skills: string[];
  links: { label: string; url: string; icon: string }[];
  experience: {
    role: string;
    company: string;
    period: string;
    description: string;
  }[];
  education: {
    degree: string;
    school: string;
    year: string;
  }[];
  contact: {
    email: string;
    phone: string;
    linkedin: string;
  };
  videoPortfolio?: VideoItem[];
}

export const mockProfiles: ProfileData[] = [
  {
    id: '1',
    slug: 'sarah-johnson',
    name: 'Sarah Johnson',
    title: 'Senior Full-Stack Developer',
    location: 'San Francisco, CA',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face',
    bio: 'Passionate developer with 8+ years building scalable web applications. Love open source, clean code, and mentoring junior developers.',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'GraphQL', 'Python'],
    links: [
      { label: 'GitHub', url: '#', icon: 'github' },
      { label: 'Portfolio', url: '#', icon: 'globe' },
      { label: 'Blog', url: '#', icon: 'pen' },
    ],
    experience: [
      { role: 'Senior Developer', company: 'TechCorp', period: '2021 – Present', description: 'Leading a team of 5 developers building micro-services architecture.' },
      { role: 'Full-Stack Developer', company: 'StartupXYZ', period: '2018 – 2021', description: 'Built the core platform from scratch, scaling to 100K users.' },
      { role: 'Junior Developer', company: 'WebAgency', period: '2016 – 2018', description: 'Developed client websites and internal tools.' },
    ],
    education: [
      { degree: 'B.Sc. Computer Science', school: 'Stanford University', year: '2016' },
    ],
    contact: { email: 'sarah@example.com', phone: '+1 555-0123', linkedin: 'linkedin.com/in/sarah-johnson' },
  },
  {
    id: 'vm-1',
    slug: 'lucas-film',
    name: 'Lucas Ferreira',
    title: 'Videomaker & Diretor Criativo',
    location: 'São Paulo, Brasil',
    photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=300&fit=crop&crop=face',
    bio: 'Diretor e videomaker com mais de 10 anos de experiência em publicidade, documentários e conteúdo digital. Especializado em storytelling visual e cinematografia.',
    skills: ['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Cinematografia', 'Color Grading', 'Motion Graphics', 'Drone', 'Sound Design'],
    links: [
      { label: 'YouTube', url: '#', icon: 'play' },
      { label: 'Vimeo', url: '#', icon: 'film' },
      { label: 'Instagram', url: '#', icon: 'camera' },
    ],
    experience: [
      { role: 'Diretor Criativo', company: 'FilmHouse BR', period: '2020 – Presente', description: 'Direção de campanhas para marcas como Ambev, Itaú e Nike Brasil.' },
      { role: 'Videomaker Sênior', company: 'ContentLab', period: '2017 – 2020', description: 'Produção de conteúdo premium para plataformas de streaming.' },
      { role: 'Editor', company: 'Produtora XYZ', period: '2014 – 2017', description: 'Edição e finalização de documentários e videoclipes.' },
    ],
    education: [
      { degree: 'B.A. Cinema e Audiovisual', school: 'ECA/USP', year: '2014' },
      { degree: 'Especialização em Cinematografia', school: 'NYFA', year: '2016' },
    ],
    contact: { email: 'lucas@filmhouse.com.br', phone: '+55 11 99999-8888', linkedin: 'linkedin.com/in/lucas-ferreira-film' },
    videoPortfolio: [
      {
        id: 'v1',
        title: 'Campanha Institucional — Banco Itaú',
        description: 'Filme publicitário completo para campanha nacional do Banco Itaú.',
        youtubeId: 'dQw4w9WgXcQ',
        duration: '3:42',
        price: 10,
        category: 'Publicidade',
      },
      {
        id: 'v2',
        title: 'Documentário — Favela Tech',
        description: 'Documentário curta-metragem sobre inovação tecnológica nas periferias de São Paulo.',
        youtubeId: 'jNQXAC9IVRw',
        duration: '18:55',
        price: 15,
        category: 'Documentário',
      },
      {
        id: 'v3',
        title: 'Videoclipe — Jovem Dionísio',
        description: 'Direção e cinematografia do videoclipe "Acelerou".',
        youtubeId: '9bZkp7q19f0',
        duration: '4:10',
        price: 8,
        category: 'Clipe',
      },
      {
        id: 'v4',
        title: 'Showreel 2024',
        description: 'Compilado dos melhores trabalhos do ano.',
        youtubeId: 'LXb3EKWsInQ',
        duration: '2:30',
        price: 5,
        category: 'Showreel',
      },
      {
        id: 'v5',
        title: 'Evento Corporativo — Samsung',
        description: 'Cobertura completa do lançamento do Galaxy S24 no Brasil.',
        youtubeId: 'ScMzIvxBSi4',
        duration: '6:20',
        price: 8,
        category: 'Evento',
      },
      {
        id: 'v6',
        title: 'Motion Graphics — Open Title',
        description: 'Abertura animada para programa de TV com motion graphics.',
        youtubeId: 'YE7VzlLtp-4',
        duration: '0:45',
        price: 5,
        category: 'Motion',
      },
      {
        id: 'v7',
        title: 'Aerial Cinematography — Pantanal',
        description: 'Imagens aéreas com drone 8K do Pantanal.',
        youtubeId: 'GceNsojnMf0',
        duration: '5:15',
        price: 12,
        category: 'Drone',
      },
      {
        id: 'v8',
        title: 'Série Web — Empreender',
        description: 'Episódio piloto de série documental sobre empreendedorismo.',
        youtubeId: 'C0DPdy98e4c',
        duration: '22:40',
        price: 20,
        category: 'Série',
      },
    ],
  },
  {
    id: '2',
    slug: 'carlos-silva',
    name: 'Carlos Silva',
    title: 'UX/UI Designer',
    location: 'São Paulo, Brazil',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    bio: 'Creative designer focused on human-centered design. I craft beautiful, intuitive interfaces that users love.',
    skills: ['Figma', 'Sketch', 'Adobe XD', 'Prototyping', 'User Research', 'Design Systems', 'CSS'],
    links: [
      { label: 'Dribbble', url: '#', icon: 'palette' },
      { label: 'Behance', url: '#', icon: 'globe' },
    ],
    experience: [
      { role: 'Lead Designer', company: 'DesignStudio', period: '2020 – Present', description: 'Leading design for 10+ enterprise clients.' },
      { role: 'UX Designer', company: 'AppCompany', period: '2017 – 2020', description: 'Redesigned the main product, increasing user retention by 40%.' },
    ],
    education: [
      { degree: 'B.A. Graphic Design', school: 'USP', year: '2017' },
    ],
    contact: { email: 'carlos@example.com', phone: '+55 11 99999-0000', linkedin: 'linkedin.com/in/carlos-silva' },
  },
  {
    id: '3',
    slug: 'marie-dupont',
    name: 'Marie Dupont',
    title: 'Data Scientist',
    location: 'Paris, France',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
    bio: 'Data scientist with a PhD in Machine Learning. Passionate about turning data into actionable insights.',
    skills: ['Python', 'TensorFlow', 'SQL', 'R', 'Spark', 'Tableau', 'NLP', 'Computer Vision'],
    links: [
      { label: 'Research', url: '#', icon: 'book' },
      { label: 'Kaggle', url: '#', icon: 'bar-chart' },
    ],
    experience: [
      { role: 'Senior Data Scientist', company: 'AI Labs', period: '2022 – Present', description: 'Building NLP models for enterprise clients.' },
      { role: 'Data Scientist', company: 'DataCorp', period: '2019 – 2022', description: 'Developed predictive models increasing revenue by 25%.' },
    ],
    education: [
      { degree: 'Ph.D. Machine Learning', school: 'Sorbonne University', year: '2019' },
      { degree: 'M.Sc. Statistics', school: 'École Polytechnique', year: '2015' },
    ],
    contact: { email: 'marie@example.com', phone: '+33 6 12 34 56 78', linkedin: 'linkedin.com/in/marie-dupont' },
  },
  {
    id: '4',
    slug: 'james-wilson',
    name: 'James Wilson',
    title: 'Product Manager',
    location: 'London, UK',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
    bio: 'Product leader with experience shipping products used by millions. I bridge the gap between business and technology.',
    skills: ['Product Strategy', 'Agile', 'Analytics', 'User Research', 'Roadmapping', 'SQL', 'Jira'],
    links: [
      { label: 'LinkedIn', url: '#', icon: 'linkedin' },
      { label: 'Medium', url: '#', icon: 'pen' },
    ],
    experience: [
      { role: 'Director of Product', company: 'BigTech', period: '2021 – Present', description: 'Managing product for a $50M revenue line.' },
      { role: 'Senior PM', company: 'SaaS Inc', period: '2018 – 2021', description: 'Launched 3 major features with 2M+ users.' },
    ],
    education: [
      { degree: 'MBA', school: 'London Business School', year: '2018' },
      { degree: 'B.Eng. Software Engineering', school: 'Imperial College', year: '2014' },
    ],
    contact: { email: 'james@example.com', phone: '+44 7700 900123', linkedin: 'linkedin.com/in/james-wilson' },
  },
  {
    id: '5',
    slug: 'ana-garcia',
    name: 'Ana García',
    title: 'Marketing Specialist',
    location: 'Madrid, Spain',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
    bio: 'Digital marketing expert specialized in growth strategies, content marketing, and brand building for tech startups.',
    skills: ['SEO', 'Content Marketing', 'Google Ads', 'Social Media', 'Analytics', 'Copywriting', 'Email Marketing'],
    links: [
      { label: 'Portfolio', url: '#', icon: 'globe' },
      { label: 'Twitter', url: '#', icon: 'twitter' },
    ],
    experience: [
      { role: 'Head of Marketing', company: 'GrowthStartup', period: '2022 – Present', description: 'Grew user base from 10K to 200K in 18 months.' },
      { role: 'Marketing Manager', company: 'AdAgency', period: '2019 – 2022', description: 'Managed campaigns for Fortune 500 clients.' },
    ],
    education: [
      { degree: 'M.A. Digital Marketing', school: 'IE Business School', year: '2019' },
    ],
    contact: { email: 'ana@example.com', phone: '+34 612 345 678', linkedin: 'linkedin.com/in/ana-garcia' },
  },
  {
    id: '6',
    slug: 'kenji-tanaka',
    name: 'Kenji Tanaka',
    title: 'DevOps Engineer',
    location: 'Tokyo, Japan',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
    bio: 'Infrastructure enthusiast who loves automating everything. Building reliable, scalable systems is my passion.',
    skills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Linux', 'Python', 'Monitoring', 'Security'],
    links: [
      { label: 'GitHub', url: '#', icon: 'github' },
      { label: 'Blog', url: '#', icon: 'pen' },
    ],
    experience: [
      { role: 'Senior DevOps', company: 'CloudScale', period: '2021 – Present', description: 'Managing infrastructure for 500+ microservices.' },
      { role: 'SRE', company: 'TechGlobal', period: '2018 – 2021', description: 'Reduced downtime by 99.5% through automation.' },
    ],
    education: [
      { degree: 'B.Sc. Information Technology', school: 'University of Tokyo', year: '2018' },
    ],
    contact: { email: 'kenji@example.com', phone: '+81 90-1234-5678', linkedin: 'linkedin.com/in/kenji-tanaka' },
  },
];
