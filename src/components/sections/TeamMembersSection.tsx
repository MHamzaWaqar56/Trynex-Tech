
'use client';

import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Facebook, Github, Linkedin, Music2, Mail, Phone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type TeamMember = {
  _id?: string;
  name: string;
  designation: string;
  coverText: string;
  image: string;
  email?: string;
  phone?: string;
  facebook?: string;
  linkedin?: string;
  github?: string;
};

type Props = {
  members: TeamMember[];
};

type SocialKey = 'facebook' | 'linkedin' | 'github';

const socialConfig: Record<SocialKey, { label: string; icon: LucideIcon }> = {
  facebook: { label: 'Facebook', icon: Facebook },
  linkedin: { label: 'LinkedIn', icon: Linkedin },
  github: { label: 'GitHub', icon: Github },
};

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function TeamMembersSection({ members }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const selectedMember = useMemo(
    () => (selectedIndex === null ? null : members[selectedIndex] || null),
    [members, selectedIndex],
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-[768px]:max-[1023px]:grid-cols-2">
        {members.map((member, index) => (
          <div
            key={member._id || `${member.name}-${index}`}
            className="portfolio-card group overflow-hidden cursor-pointer rounded-2xl"
            onClick={() => setSelectedIndex(index)}
          >
            {/* Image */}
            <div className="h-72 relative overflow-hidden bg-gray-100">
              {!imgErrors[index] ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={() => setImgErrors((prev) => ({ ...prev, [index]: true }))}
                />
              ) : (
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                  <span className="text-5xl font-black text-primary">
                    {getInitials(member.name)}
                  </span>
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Social links on hover */}
              <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 translate-y-10 items-center gap-2 rounded-xl border border-primary/20 bg-primary/20 px-3 py-2 opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {member.email && (
                  <a href={`mailto:${member.email}`} aria-label="Email"
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-primary hover:border-primary transition-all">
                    <Mail size={15} />
                  </a>
                )}
                {member.phone && (
                  <a href={`tel:${member.phone}`} aria-label="Phone"
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-primary transition-all">
                    <Phone size={15} />
                  </a>
                )}
                
                {member.facebook && (
                  <a href={member.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-primary transition-all">
                    <Facebook size={15} />
                  </a>
                )}
                {member.linkedin && (
                  <a href={member.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-primary transition-all">
                    <Linkedin size={15} />
                  </a>
                )}
                {member.github && (
                  <a href={member.github} target="_blank" rel="noreferrer" aria-label="GitHub"
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-primary transition-all">
                    <Github size={15} />
                  </a>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-display text-lg font-bold text-gray-900">{member.name}</h3>
              <p className="text-primary text-xs font-mono uppercase tracking-widest mt-[0.1rem]">{member.designation}</p>
              <p className="text-gray-900 text-sm leading-relaxed mt-3 line-clamp-3">{member.coverText}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog */}
      <Dialog open={selectedMember !== null} onOpenChange={(open) => { if (!open) setSelectedIndex(null); }}>
        {selectedMember && (
          <DialogContent className="!max-w-4xl overflow-hidden h-[550px] min-[320px]:max-[990px]:h-[90vh] min-[320px]:max-[990px]:w-[90vw] min-[320px]:max-[767px]:overflow-auto min-[320px]:max-[767px]:p-4">
            <div className="grid grid-cols-2 lg:grid-cols-[1.05fr_1.15fr] h-full min-[320px]:max-[767px]:grid-cols-1">

              {/* Image */}
              <div className="bg-gray-100 overflow-hidden rounded-2xl">
                {imgErrors[selectedIndex!] ? (
                  <div className="h-full w-full flex items-center justify-center bg-primary/10">
                    <span className="text-6xl font-black text-primary">
                      {getInitials(selectedMember.name)}
                    </span>
                  </div>
                ) : (
                  <img
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    className="h-full w-full object-cover rounded-2xl"
                  />
                )}
              </div>

              {/* Info */}
              <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center  min-[320px]:max-[767px]:px-4">
                <DialogHeader className="pr-0">
                  <DialogTitle className="!text-3xl !text-gray-900 sm:text-4xl !font-display">
                    {selectedMember.name}
                  </DialogTitle>
                  <DialogDescription className="!text-base !text-primary !font-mono !uppercase !tracking-widest !mt-[0.1rem]">
                    {selectedMember.designation}
                  </DialogDescription>
                </DialogHeader>

                <p className="mt-6 text-gray-900 leading-relaxed text-base sm:text-lg">
                  {selectedMember.coverText}
                </p>

                <div className="mt-8">
                  <div className="text-xs uppercase tracking-widest text-gray-900 font-mono mb-3">
                    Connect
                  </div>
                  <div className="flex flex-wrap gap-3 min-[320px]:max-[767px]:grid min-[320px]:max-[767px]:grid-cols-2">
                    {selectedMember.email && (
                      <a href={`mailto:${selectedMember.email}`}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-900 px-4 py-2 text-sm text-gray-900 hover:border-primary hover:text-primary transition-colors">
                        <Mail className="h-4 w-4" /> Email
                      </a>
                    )}
                    {selectedMember.phone && (
                      <a href={`tel:${selectedMember.phone}`}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-900 px-4 py-2 text-sm text-gray-900 hover:border-primary hover:text-primary transition-colors">
                        <Phone className="h-4 w-4" /> Phone
                      </a>
                    )}
                    {(Object.keys(socialConfig) as SocialKey[]).map((key) => {
                      const href = selectedMember[key];
                      if (!href) return null;
                      const { icon: Icon, label } = socialConfig[key];
                      return (
                        <a key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                          className="inline-flex items-center gap-2 rounded-full border border-gray-900 px-4 py-2 text-sm text-gray-900 hover:border-primary hover:text-primary transition-colors">
                          <Icon className="h-4 w-4" /> {label}
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}