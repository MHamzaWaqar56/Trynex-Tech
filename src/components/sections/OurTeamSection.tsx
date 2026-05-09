import {  Users,  CheckCircle2 } from 'lucide-react';
import { connectDB } from '@/lib/db';
import { TeamMember as TeamMemberModel } from '@/models/TeamMember';
import TeamMembersSection from '@/components/sections/TeamMembersSection';


type TeamMemberRecord = {
  _id: string;
  name: string;
  designation: string;
  coverText: string;
  image: string;
  facebook?: string;
  email?: string;
  linkedin?: string;
  github?: string;
};

async function getTeamMembers(): Promise<TeamMemberRecord[]> {
  await connectDB();
  return TeamMemberModel.find({}).sort({ order: 1, createdAt: -1 }).lean<TeamMemberRecord[]>();
}

export default async function OurTeamSection() {
  const teamMembers = await getTeamMembers();

  return (
    <>
    
      {/* Team */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="mb-4">
            <span className="section-badge">
              <Users className="h-4 w-4 inline mr-1 animate-pulse" /> Meet the Team
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <h2 className="section-title">
              The People <span className="gradient-text">Behind the Magic</span>
            </h2>
            <p className="text-gray-900 text-base max-w-sm">
              A passionate team of specialists committed to your growth.
            </p>
          </div>

          {teamMembers.length === 0 ? (
            <div className="portfolio-card p-8 text-center text-gray-900">
              No team members have been added yet.
            </div>
          ) : (
            <TeamMembersSection members={teamMembers} />
          )}
        </div>
      </section>

    </>
  );
}