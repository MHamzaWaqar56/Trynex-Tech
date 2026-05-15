// import {
//   Award,
//   Briefcase,
//   Facebook,
//   Github,
//   GraduationCap,
//   Linkedin,
//   Mail,
//   Quote,
//   Star,
//   User2,
// } from 'lucide-react';
// import Image from 'next/image';

// const education = [
//   {
//     degree: 'Bachelor of Science in Software Engineering',
//     institution: 'University of Sahiwal',
//     year: '2020 – 2024',
//     grade: 'CGPA 3.2 / 4.0',
//   },
//   {
//     degree: 'Intermediate (Pre-Engineering)',
//     institution: 'Government Degree College, Chichawatni',
//     year: '2018 – 2020',
//     grade: 'A+ Grade',
//   },
//   {
//     degree: 'Matriculation (Science Group)',
//     institution: 'Dawn High School, Chichawatni',
//     year: '2016 – 2018',
//     grade: 'A+ Grade',
//   },
// ];

// const experience = [
//   {
//     role: 'CEO & Co-founder',
//     company: 'Trynex Tech',
//     period: '2021 – Present',
//     desc: 'Leading strategy, business development, and delivery of full-stack software, SEO, and AI solutions for clients across Pakistan and globally.',
//   },
//   {
//     role: 'Senior Web Developer',
//     company: 'Rehman Software House Chichawatni',
//     period: '2020 – 2022',
//     desc: 'Built scalable web applications using Next.js and Node.js, led a team of 4 developers, and managed client communications.',
//   },
//   {
//     role: 'Senior Web Developer ',
//     company: 'YourLogics Software House, Lahore',
//     period: '2024 – Present',
//     desc: 'Developed responsive websites and e-commerce platforms, gained hands-on experience with SEO and performance optimization.',
//   },
// ];

// export default function CEOIntroSection() {
//   return (
//     <section className="py-16 bg-white">
//       <div className="container-custom">

//         {/* Section Header */}
//         <div className="mb-12 text-center">
//           <div className="mb-4 flex justify-center">
//             <span className="section-badge">
//               <User2 className="h-4 w-4 inline mr-1 animate-pulse" />
//               Leadership
//             </span>
//           </div>
//           <h2 className="section-title">
//             Meet Our <span className="gradient-text">CEO</span>
//           </h2>
//           <p className="text-gray-900 text-base mt-3 max-w-xl mx-auto">
//             The vision and drive behind Trynex Tech's journey from a startup to a trusted software house.
//           </p>
//         </div>

//         {/* Top Card — Photo + Intro */}
//         <div className="portfolio-card rounded-2xl p-8 lg:p-12 mb-8">
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">

//             {/* Photo */}
//             <div className="flex flex-col items-center lg:items-start gap-4">
//               <div className="relative min-[320px]:max-[1023px]:w-full min-[320px]:max-[1023px]:h-[45rem]">
//                 <div className="w-48 h-48 rounded-2xl border-2X min-[320px]:max-[1023px]:w-full min-[320px]:max-[1023px]:!h-192 overflow-hidden"
//                 style={{ borderColor: 'rgba(0,212,255,0.3)' }}
//               >
//                 <Image
//                   src="https://res.cloudinary.com/da8lxpc3h/image/upload/v1777608544/team/fydb8hoxpydcsss3eni6.jpg"
//                   alt="CEO Trynex Tech"
//                   width={192}
//                   height={192}
//                   className="w-full h-full object-cover min-[320px]:max-[1023px]:object-cover"
//                 />
//               </div>
//                 {/* Online badge */}
//                 <div className="absolute -bottom-3 -right-3 bg-white rounded-xl px-3 py-1.5 flex items-center gap-2"
//                   style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
//                   <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
//                   <span className="text-xs font-semibold text-gray-900">Available</span>
//                 </div>
//               </div>

//               {/* Social Links */}
//               <div className="flex items-center gap-3 mt-4">
//                 <a
//                   href="mailto:ceo@trynextech.com"
//                   className="w-9 h-9 rounded-lg bg-primary/10 border flex items-center justify-center hover:bg-primary/20 transition-colors"
//                   style={{ borderColor: 'rgba(0,212,255,0.25)' }}
//                   title="Email"
//                 >
//                   <Mail className="w-4 h-4 text-primary" />
//                 </a>
//                 <a
//                   href="https://linkedin.com"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="w-9 h-9 rounded-lg bg-primary/10 border flex items-center justify-center hover:bg-primary/20 transition-colors"
//                   style={{ borderColor: 'rgba(0,212,255,0.25)' }}
//                   title="LinkedIn"
//                 >
//                   <Linkedin className="w-4 h-4 text-primary" />
//                 </a>
//                 <a
//                   href="https://github.com"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="w-9 h-9 rounded-lg bg-primary/10 border flex items-center justify-center hover:bg-primary/20 transition-colors"
//                   style={{ borderColor: 'rgba(0,212,255,0.25)' }}
//                   title="GitHub"
//                 >
//                   <Github className="w-4 h-4 text-primary" />
//                 </a>
//                 <a
//                   href="https://facebook.com"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="w-9 h-9 rounded-lg bg-primary/10 border flex items-center justify-center hover:bg-primary/20 transition-colors"
//                   style={{ borderColor: 'rgba(0,212,255,0.25)' }}
//                   title="Facebook"
//                 >
//                   <Facebook className="w-4 h-4 text-primary" />
//                 </a>
//               </div>
//             </div>

//             {/* Intro Text */}
//             <div className="lg:col-span-2">
//               <div className="flex items-center gap-3 mb-2 min-[320px]:max-[767px]:flex-col-reverse min-[320px]:max-[767px]:items-start">
//                 <h3 className="font-display font-bold text-2xl sm:text-3xl text-gray-900">
//                   Muhammad Hamza Waqar
//                 </h3>
//                 <span className="section-badge text-[10px] !py-1">CEO & Co-founder</span>
//               </div>
//               <p className="text-primary font-semibold text-sm mb-5">Trynex Tech · Chichawatni, Pakistan</p>

//               {/* Quote */}
//               <div
//                 className="rounded-xl p-5 mb-6 relative"
//                 style={{ background: 'rgba(0,212,255,0.05)', borderLeft: '3px solid #00D4FF' }}
//               >
//                 <Quote className="w-5 h-5 text-primary/40 absolute top-4 right-4" />
//                 <p className="text-gray-900 leading-relaxed text-sm italic">
//                   "Our mission at Trynex Tech is simple — deliver technology that actually moves the needle
//                   for our clients. We don't just build software, we build growth engines tailored to your business."
//                 </p>
//               </div>

//               <p className="text-gray-900 leading-relaxed text-sm mb-4">
//                 With over <span className="font-semibold text-gray-900">5 years of hands-on experience</span> in
//                 software development — Muhammad Hamza Waqar founded Trynex Tech with a clear vision: make
//                 world-class digital solutions accessible to Pakistani businesses and beyond.
//               </p>
//               <p className="text-gray-900 leading-relaxed text-sm">
//                 He leads a passionate team of specialists, oversees every major project, and personally ensures
//                 that each client gets measurable, real-world results.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Education + Experience Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

//           {/* Education */}
//           <div className="portfolio-card rounded-2xl p-8">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
//                 <GraduationCap className="w-5 h-5 text-primary" />
//               </div>
//               <h4 className="font-display font-bold text-gray-900 text-lg">Education</h4>
//             </div>
//             <div className="flex flex-col gap-5">
//               {education.map((edu, i) => (
//                 <div
//                   key={i}
//                   className="relative pl-5"
//                   style={{ borderLeft: '2px solid rgba(0,212,255,0.25)' }}
//                 >
//                   <div
//                     className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-primary"
//                   />
//                   <p className="font-semibold text-gray-900 text-sm mb-0.5">{edu.degree}</p>
//                   <p className="text-primary text-xs font-medium mb-0.5">{edu.institution}</p>
//                   <div className="flex items-center gap-3 text-xs text-gray-900">
//                     <span>{edu.year}</span>
//                     <span className="w-1 h-1 rounded-full bg-gray-400" />
//                     <span>{edu.grade}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Experience */}
//           <div className="portfolio-card rounded-2xl p-8">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
//                 <Briefcase className="w-5 h-5 text-primary" />
//               </div>
//               <h4 className="font-display font-bold text-gray-900 text-lg">Experience</h4>
//             </div>
//             <div className="flex flex-col gap-5">
//               {experience.map((exp, i) => (
//                 <div
//                   key={i}
//                   className="relative pl-5"
//                   style={{ borderLeft: '2px solid rgba(0,212,255,0.25)' }}
//                 >
//                   <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-primary" />
//                   <div className="flex items-center gap-2 mb-0.5 flex-wrap">
//                     <p className="font-semibold text-gray-900 text-sm">{exp.role}</p>
//                     {i === 0 && (
//                       <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
//                         style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.25)' }}>
//                         Current
//                       </span>
//                     )}
//                   </div>
//                   <p className="text-primary text-xs font-medium mb-1">{exp.company} · {exp.period}</p>
//                   <p className="text-gray-900 text-xs leading-relaxed">{exp.desc}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//       </div>
//     </section>
//   );
// }



















import {
  Award,
  Briefcase,
  Facebook,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  Quote,
  Star,
  User2,
} from 'lucide-react';
import Image from 'next/image';

const education = [
  {
    degree: 'Bachelor of Science in Software Engineering',
    institution: 'University of Sahiwal',
    year: '2020 – 2024',
    grade: 'CGPA 3.2 / 4.0',
  },
  {
    degree: 'Intermediate (Pre-Engineering)',
    institution: 'Government Degree College, Chichawatni',
    year: '2018 – 2020',
    grade: 'A+ Grade',
  },
  {
    degree: 'Matriculation (Science Group)',
    institution: 'Dawn High School, Chichawatni',
    year: '2016 – 2018',
    grade: 'A+ Grade',
  },
];

const experience = [
  {
    role: 'CEO & Co-founder',
    company: 'Trynex Tech',
    period: '2021 – Present',
    desc: 'Leading strategy, business development, and delivery of full-stack software, SEO, and AI solutions for clients across Pakistan and globally.',
  },
  {
    role: 'Senior Web Developer',
    company: 'Rehman Software House Chichawatni',
    period: '2020 – 2022',
    desc: 'Built scalable web applications using Next.js and Node.js, led a team of 4 developers, and managed client communications.',
  },
  {
    role: 'Senior Web Developer',
    company: 'YourLogics Software House, Lahore',
    period: '2024 – Present',
    desc: 'Developed responsive websites and e-commerce platforms, gained hands-on experience with SEO and performance optimization.',
  },
];


export default function CEOIntroSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container-custom">

        {/* Section Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex justify-center">
            <span className="section-badge">
              <User2 className="h-4 w-4 inline mr-1 animate-pulse" />
              Leadership
            </span>
          </div>
          <h2 className="section-title">
            Meet Our <span className="gradient-text">CEO</span>
          </h2>
          <p className="text-gray-900 text-base mt-3 max-w-xl mx-auto">
            The vision and drive behind Trynex Tech&apos;s journey from a startup to a trusted software house.
          </p>
        </div>

        {/* Top Card — Photo + Intro */}
        <div className="portfolio-card rounded-2xl p-8 lg:p-12 mb-8 min-[320px]:max-[767px]:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">

            {/* Photo */}
            <div className="flex flex-col items-center lg:items-start gap-4">
              <div
                className="relative
                  w-60 h-60
                  min-[768px]:max-[1023px]:w-full min-[768px]:max-[1023px]:h-[45rem]
                  min-[500px]:max-[767px]:w-full  min-[550px]:max-[767px]:h-[35rem]  min-[450px]:max-[549px]:h-[25rem]
                  min-[320px]:max-[499px]:w-full  min-[320px]:max-[449px]:h-[18rem]
                "
              >
                <div
                  className="w-full h-full rounded-2xl border-2 overflow-hidden"
                  style={{ borderColor: 'rgba(0,212,255,0.3)' }}
                >
                  <Image
                    src="https://res.cloudinary.com/da8lxpc3h/image/upload/v1777608544/team/fydb8hoxpydcsss3eni6.jpg"
                    alt="CEO Trynex Tech"
                    width={192}
                    height={192}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                {/* Online badge */}
                <div
                  className="absolute -bottom-3 -right-3 bg-white rounded-xl px-3 py-1.5 flex items-center gap-2"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                >
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-semibold text-gray-900">Available</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 mt-4">
                <a
                  href="mailto:ceo@trynextech.com"
                  className="w-9 h-9 rounded-lg bg-primary/10 border flex items-center justify-center hover:bg-primary/20 transition-colors"
                  style={{ borderColor: 'rgba(0,212,255,0.25)' }}
                  title="Email"
                >
                  <Mail className="w-4 h-4 text-primary" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-primary/10 border flex items-center justify-center hover:bg-primary/20 transition-colors"
                  style={{ borderColor: 'rgba(0,212,255,0.25)' }}
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 text-primary" />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-primary/10 border flex items-center justify-center hover:bg-primary/20 transition-colors"
                  style={{ borderColor: 'rgba(0,212,255,0.25)' }}
                  title="GitHub"
                >
                  <Github className="w-4 h-4 text-primary" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-primary/10 border flex items-center justify-center hover:bg-primary/20 transition-colors"
                  style={{ borderColor: 'rgba(0,212,255,0.25)' }}
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4 text-primary" />
                </a>
              </div>
            </div>

            {/* Intro Text */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-2 min-[320px]:max-[767px]:flex-col-reverse min-[320px]:max-[767px]:items-start">
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 min-[320px]:max-[380px]:text-[1.4rem]">
                  Muhammad Hamza Waqar
                </h3>
                <span className="section-badge text-[10px] !py-1">CEO & Co-founder</span>
              </div>
              <p className="text-primary font-semibold text-sm mb-5">Trynex Tech · Chichawatni, Pakistan</p>

              {/* Quote */}
              <div
                className="rounded-xl p-5 mb-6 relative"
                style={{ background: 'rgba(0,212,255,0.05)', borderLeft: '3px solid #00D4FF' }}
              >
                <Quote className="w-5 h-5 text-primary/40 absolute top-4 right-4" />
                <p className="text-gray-900 leading-relaxed text-sm italic text-justify">
                  &quot;Our mission at Trynex Tech is simple — deliver technology that actually moves the needle
                  for our clients. We don&apos;t just build software, we build growth engines tailored to your business.&quot;
                </p>
              </div>

              <p className="text-gray-900 leading-relaxed text-sm mb-4 text-justify">
                With over <span className="font-semibold text-gray-900">5 years of hands-on experience</span> in
                software development — Muhammad Hamza Waqar founded Trynex Tech with a clear vision: make
                world-class digital solutions accessible to Pakistani businesses and beyond.
              </p>
              <p className="text-gray-900 leading-relaxed text-sm text-justify">
                He leads a passionate team of specialists, oversees every major project, and personally ensures
                that each client gets measurable, real-world results.
              </p>
            </div>
          </div>
        </div>

        {/* Education + Experience Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 ">

          {/* Education */}
          <div className="portfolio-card rounded-2xl p-8 min-[320px]:max-[767px]:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-display font-bold text-gray-900 text-lg">Education</h4>
            </div>
            <div className="flex flex-col gap-5">
              {education.map((edu, i) => (
                <div
                  key={i}
                  className="relative pl-5"
                  style={{ borderLeft: '2px solid rgba(0,212,255,0.25)' }}
                >
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-primary" />
                  <p className="font-semibold text-gray-900 text-sm mb-0.5">{edu.degree}</p>
                  <p className="text-primary text-xs font-medium mb-0.5">{edu.institution}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-900">
                    <span>{edu.year}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-400" />
                    <span>{edu.grade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="portfolio-card rounded-2xl p-8 min-[320px]:max-[767px]:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-display font-bold text-gray-900 text-lg">Experience</h4>
            </div>
            <div className="flex flex-col gap-5">
              {experience.map((exp, i) => (
                <div
                  key={i}
                  className="relative pl-5"
                  style={{ borderLeft: '2px solid rgba(0,212,255,0.25)' }}
                >
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-primary" />
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">{exp.role}</p>
                    {i === 0 && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.25)' }}
                      >
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-primary text-xs font-medium mb-1">{exp.company} · {exp.period}</p>
                  <p className="text-gray-900 text-xs leading-relaxed min-[320px]:max-[767px]:text-justify">{exp.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>


      </div>
    </section>
  );
}