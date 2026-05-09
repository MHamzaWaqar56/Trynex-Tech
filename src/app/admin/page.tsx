'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  BookOpen, Briefcase, Calendar, DollarSign,
  FolderOpen, LogOut, Mail, MessageSquare,
  Settings, Star, TrendingUp, UserCircle, BarChart2,
  Menu, X,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

// ── Tab components
import MessagesTab      from '@/components/admin/MessagesTab';
import LeadsTab         from '@/components/admin/LeadsTab';
import NewsletterTab    from '@/components/admin/NewsletterTab';
import CurrencyTab      from '@/components/admin/CurrencyTab';
import ConsultationsTab from '@/components/admin/ConsultationsTab';
import BlogsTab         from '@/components/admin/BlogsTab';
import PortfolioTab     from '@/components/admin/PortfolioTab';
import ServicesTab      from '@/components/admin/ServicesTab';
import TeamTab          from '@/components/admin/TeamTab';
import TestimonialsTab  from '@/components/admin/TestimonialsTab';
import CareersTab       from '@/components/admin/CareersTab';
import StatsTab         from '@/components/admin/StatsTab';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey =
  | 'newsletter' | 'messages' | 'leads' | 'currency'
  | 'consultations' | 'blogs' | 'portfolio' | 'services'
  | 'careers' | 'team' | 'testimonials' | 'stats';

interface Message {
  _id: string; name: string; email: string; service?: string;
  message: string; inquiryType?: string; status: string; createdAt: string;
}
interface Lead {
  _id: string; name: string; email: string; phone?: string; company?: string;
  service: string; budget?: string; deadline?: string; message: string;
  leadType: string; status: string; createdAt: string;
}
interface BlogPost {
  _id: string; title: string; slug: string; excerpt?: string; content: string;
  tags?: string[]; author?: string; published: boolean; coverImage?: string; createdAt?: string;
}
interface PortfolioProject {
  _id: string; title: string; slug: string; client: string; service: string;
  description: string; results?: Array<{ label: string; value: string }>;
  tech?: string[]; images?: string[]; featured?: boolean; order?: number;
}
interface Testimonial {
  _id: string; name: string; company: string; role?: string;
  rating: number; review: string; approved: boolean;
}
interface ManagedService {
  _id: string; title: string; slug: string; coverImage: string; summary: string;
  bullets: string[]; tags: string[]; details: string; featured?: boolean;
  packages: Array<{ name: string; price: string | number; period: string; description: string; features: string[]; highlighted: boolean; cta?: string }>;
  order?: number;
}
interface CareerVacancy {
  _id: string; title: string; slug: string; department: string; location: string;
  employmentType: string; salary?: string; description: string; responsibilities: string[];
  requirements: string[]; perks: string[]; applicationDeadline?: string;
  featured?: boolean; open?: boolean; order?: number;
}
interface CareerApplication {
  _id: string; vacancyTitle: string; vacancySlug: string; fullName: string; email: string;
  phone?: string; linkedin?: string; portfolioUrl?: string; yearsOfExperience?: string;
  coverLetter: string; cvUrl: string; cvName?: string;
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'; createdAt: string;
}
interface ConsultationBooking {
  _id: string; date: string; time: string; name: string; email: string; phone?: string;
  service: string; message?: string; status: 'pending' | 'confirmed' | 'cancelled'; createdAt: string;
}
interface TeamMember {
  _id: string; name: string; designation: string; coverText: string; image: string;
  facebook?: string; email?: string; linkedin?: string; github?: string; order?: number;
}

type DeleteDialogState = {
  title: string; description: string; confirmLabel: string;
  onConfirm: () => Promise<void>;
};
type DetailDialogState = {
  title: string; subtitle: string;
  fields: Array<{ label: string; value: string }>;
  messageLabel: string; message: string;
};

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS: Array<{ key: TabKey; label: string; icon: React.ElementType }> = [
  { key: 'stats',         label: 'Dashboard',      icon: BarChart2     },
  { key: 'messages',      label: 'Messages',       icon: MessageSquare },
  { key: 'leads',         label: 'Leads',          icon: TrendingUp    },
  { key: 'newsletter',    label: 'Newsletter',     icon: Mail          },
  { key: 'currency',      label: 'Currency',       icon: DollarSign    },
  { key: 'consultations', label: 'Consultation',   icon: Calendar      },
  { key: 'blogs',         label: 'Blogs',          icon: BookOpen      },
  { key: 'portfolio',     label: 'Portfolio',      icon: FolderOpen    },
  { key: 'services',      label: 'Services',       icon: Settings      },
  { key: 'team',          label: 'Team',           icon: UserCircle    },
  { key: 'testimonials',  label: 'Testimonials',   icon: Star          },
  { key: 'careers',       label: 'Careers',        icon: Briefcase     },
];

// ─── SidebarNav ───────────────────────────────────────────────────────────────

function SidebarNav({
  activeTab,
  onNavigate,
  onLogout,
}: {
  activeTab: TabKey;
  onNavigate: (tab: TabKey) => void;
  onLogout: () => void;
}) {
  return (
    <>
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onNavigate(key)}
              className={`group relative flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'text-primary font-semibold bg-primary/10'
                  : 'text-gray-900 hover:bg-primary/10'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-[4px] bg-primary" />
              )}
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-gray-900'}`} />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-primary/10">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 py-4 px-4 text-sm text-gray-900 hover:bg-red-50 hover:text-red-500 font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [loading,       setLoading]       = useState(true);
  const [adminEmail,    setAdminEmail]    = useState('');
  const [activeTab,     setActiveTab]     = useState<TabKey>('stats');
  const [sidebarOpen,   setSidebarOpen]   = useState(false);

  // ── Data
  const [messages,      setMessages]      = useState<Message[]>([]);
  const [leads,         setLeads]         = useState<Lead[]>([]);
  const [blogs,         setBlogs]         = useState<BlogPost[]>([]);
  const [projects,      setProjects]      = useState<PortfolioProject[]>([]);
  const [reviews,       setReviews]       = useState<Testimonial[]>([]);
  const [teamMembers,   setTeamMembers]   = useState<TeamMember[]>([]);
  const [services,      setServices]      = useState<ManagedService[]>([]);
  const [vacancies,     setVacancies]     = useState<CareerVacancy[]>([]);
  const [applications,  setApplications]  = useState<CareerApplication[]>([]);
  const [consultations, setConsultations] = useState<ConsultationBooking[]>([]);

  // ── Editing IDs
  const [editingBlogId,      setEditingBlogId]      = useState<string | null>(null);
  const [editingProjectSlug, setEditingProjectSlug] = useState<string | null>(null);
  const [editingServiceId,   setEditingServiceId]   = useState<string | null>(null);
  const [editingVacancyId,   setEditingVacancyId]   = useState<string | null>(null);
  const [editingTeamId,      setEditingTeamId]      = useState<string | null>(null);

  // ── Dialogs
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState | null>(null);
  const [detailDialog, setDetailDialog] = useState<DetailDialogState | null>(null);
  const [deleteBusy,   setDeleteBusy]   = useState(false);

  const [logoutDialog, setLogoutDialog] = useState(false);
  const [logoutBusy,   setLogoutBusy]   = useState(false);

  // ─── Fetch all ───────────────────────────────────────────────────────────

  const fetchAll = async () => {
    const meRes = await fetch('/api/admin/me');
    if (!meRes.ok) { router.push('/admin/login'); return; }
    const meData = await meRes.json();
    setAdminEmail(meData.admin?.email || '');

    const [
      messagesRes, leadsRes, blogsRes, projectsRes,
      reviewsRes, teamRes, servicesRes, vacanciesRes,
      applicationsRes, consultationsRes,
    ] = await Promise.all([
      fetch('/api/admin/messages'),
      fetch('/api/admin/leads'),
      fetch('/api/blogs?all=1'),
      fetch('/api/portfolio'),
      fetch('/api/testimonials?all=1'),
      fetch('/api/admin/team'),
      fetch('/api/admin/services'),
      fetch('/api/admin/careers'),
      fetch('/api/admin/careers/applications'),
      fetch('/api/admin/consultations'),
    ]);

    if (messagesRes.ok) {
      const all = (await messagesRes.json()).messages || [];
      setMessages(all.filter((m: Message) => m.inquiryType !== 'lead'));
    }
    if (leadsRes.ok)         setLeads((await leadsRes.json()).leads || []);
    if (blogsRes.ok)         setBlogs((await blogsRes.json()).posts || []);
    if (projectsRes.ok)      setProjects((await projectsRes.json()).projects || []);
    if (reviewsRes.ok)       setReviews((await reviewsRes.json()).reviews || []);
    if (teamRes.ok)          setTeamMembers((await teamRes.json()).members || []);
    if (servicesRes.ok)      setServices((await servicesRes.json()).services || []);
    if (vacanciesRes.ok)     setVacancies((await vacanciesRes.json()).vacancies || []);
    if (applicationsRes.ok)  setApplications((await applicationsRes.json()).applications || []);
    if (consultationsRes.ok) setConsultations((await consultationsRes.json()).consultations || []);

    setLoading(false);
  };

  useEffect(() => { void fetchAll(); }, []);

  // ─── URL → tab sync ──────────────────────────────────────────────────────

  useEffect(() => {
    const tab         = searchParams.get('tab') as TabKey | null;
    const editId      = searchParams.get('edit');
    const editProject = searchParams.get('editProject');
    const editService = searchParams.get('editService');
    const editVacancy = searchParams.get('editVacancy');
    const editTeam    = searchParams.get('editTeam');

    if (tab)         setActiveTab(tab);
    if (editId)      { setActiveTab('blogs');     setEditingBlogId(editId); }
    if (editProject) { setActiveTab('portfolio'); setEditingProjectSlug(editProject); }
    if (editService) { setActiveTab('services');  setEditingServiceId(editService); }
    if (editVacancy) { setActiveTab('careers');   setEditingVacancyId(editVacancy); }
    if (editTeam)    { setActiveTab('team');      setEditingTeamId(editTeam); }
  }, [searchParams]);

  // ─── Reload helpers ──────────────────────────────────────────────────────

  const reloadMessages      = async () => { const r = await fetch('/api/admin/messages');             if (r.ok) { const all = (await r.json()).messages || []; setMessages(all.filter((m: Message) => m.inquiryType !== 'lead')); } };
  const reloadLeads         = async () => { const r = await fetch('/api/admin/leads');                if (r.ok) setLeads((await r.json()).leads || []); };
  const reloadBlogs         = async () => { const r = await fetch('/api/blogs?all=1');                if (r.ok) setBlogs((await r.json()).posts || []); };
  const reloadProjects      = async () => { const r = await fetch('/api/portfolio');                  if (r.ok) setProjects((await r.json()).projects || []); };
  const reloadReviews       = async () => { const r = await fetch('/api/testimonials?all=1');         if (r.ok) setReviews((await r.json()).reviews || []); };
  const reloadTeam          = async () => { const r = await fetch('/api/admin/team');                 if (r.ok) setTeamMembers((await r.json()).members || []); };
  const reloadServices      = async () => { const r = await fetch('/api/admin/services');             if (r.ok) setServices((await r.json()).services || []); };
  const reloadVacancies     = async () => { const r = await fetch('/api/admin/careers');              if (r.ok) setVacancies((await r.json()).vacancies || []); };
  const reloadApplications  = async () => { const r = await fetch('/api/admin/careers/applications'); if (r.ok) setApplications((await r.json()).applications || []); };
  const reloadConsultations = async () => { const r = await fetch('/api/admin/consultations');        if (r.ok) setConsultations((await r.json()).consultations || []); };

  // ─── Other helpers ────────────────────────────────────────────────────────

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/lead/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) { await reloadLeads(); toast.success('Lead status updated.'); }
      else toast.error('Lead status update failed.');
    } catch { toast.error('Lead status update failed.'); }
  };

  const openGmailReply = (to: string, subject: string, body: string) => {
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      '_blank', 'noopener,noreferrer',
    );
  };

  const openDeleteDialog = (d: DeleteDialogState) => setDeleteDialog(d);
  const openDetailDialog = (d: DetailDialogState) => setDetailDialog(d);

  const handleDeleteConfirm = async () => {
    if (!deleteDialog) return;
    setDeleteBusy(true);
    try { await deleteDialog.onConfirm(); setDeleteDialog(null); }
    finally { setDeleteBusy(false); }
  };

  const navigateToTab = (tab: TabKey) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    setEditingBlogId(null);
    setEditingProjectSlug(null);
    setEditingServiceId(null);
    setEditingVacancyId(null);
    setEditingTeamId(null);
    router.replace(tab === 'stats' ? '/admin' : `/admin?tab=${tab}`);
  };

  const confirmLogout = async () => {
    setLogoutBusy(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } finally {
      setLogoutBusy(false);
      setLogoutDialog(false);
    }
  };

  const handleLogout = () => setLogoutDialog(true);

  const currentTab = TABS.find((t) => t.key === activeTab);

  // ─── Loading ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ══════════════════════════════════════════════════
          MOBILE TOP BAR  (hidden on lg+)
          — sits right below the main site navbar (h-16 = 64px)
      ══════════════════════════════════════════════════ */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-30 flex items-center gap-3 bg-white border-b border-slate-200 px-4 h-12 shadow-sm">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setSidebarOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-gray-600 hover:bg-slate-50 transition-colors shrink-0"
        >
          <Menu className="w-4 h-4" />
        </button>
        {currentTab && (
          <div className="flex items-center gap-2 min-w-0">
            <currentTab.icon className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-semibold text-gray-900 truncate">{currentTab.label}</span>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════
          MOBILE BACKDROP
      ══════════════════════════════════════════════════ */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ══════════════════════════════════════════════════
          DESKTOP LAYOUT WRAPPER — flex row (sidebar + content)
      ══════════════════════════════════════════════════ */}
      <div className="lg:flex lg:items-start">

        {/* ══════════════════════════════════════════════════
            SIDEBAR
            Mobile  → fixed drawer slides in from left
            Desktop → sticky inside flex row, below 64px navbar
        ══════════════════════════════════════════════════ */}
        <aside
          className={`
            fixed top-0 left-0 z-50 h-full w-[240px] bg-white flex flex-col
            transition-transform duration-300 ease-in-out
            shadow-[4px_0_24px_rgba(0,0,0,0.10)]
            lg:sticky lg:top-16 lg:z-auto lg:shrink-0
            lg:h-[calc(100vh-4rem)]
            lg:shadow-[1px_0_0_0_#e2e8f0]
            lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          {/* Drawer header — mobile only */}
          <div className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-slate-100">
            <span className="text-sm font-bold text-gray-900">Admin Panel</span>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Logo / email row — desktop only */}
          <div className="hidden lg:flex items-center gap-2.5 px-4 pt-6 pb-2 border-b border-slate-100">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <BarChart2 className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-semibold text-gray-700 truncate">
              {adminEmail || 'Admin Panel'}
            </span>
          </div>

          <SidebarNav
            activeTab={activeTab}
            onNavigate={navigateToTab}
            onLogout={handleLogout}
          />
        </aside>

        {/* ══════════════════════════════════════════════════
            MAIN CONTENT
            — mobile: pt-28 for navbar(4rem) + admin bar(3rem)
            — desktop: pt-6, flex-1 fills remaining width
        ══════════════════════════════════════════════════ */}
        <div className="flex-1 min-w-0">
          <main className="min-h-[100vh] p-3 pt-[8rem] sm:p-4 sm:pt-28 lg:p-6 lg:pt-[9rem] lg:pb-[5rem]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {activeTab === 'stats' && <StatsTab />}

            {activeTab === 'messages' && (
              <MessagesTab
                messages={messages}
                onViewDetails={openDetailDialog}
                onDelete={openDeleteDialog}
                onGmailReply={openGmailReply}
                onRefresh={reloadMessages}
              />
            )}

            {activeTab === 'leads' && (
              <LeadsTab
                leads={leads}
                onViewDetails={openDetailDialog}
                onDelete={openDeleteDialog}
                onGmailReply={openGmailReply}
                onUpdateStatus={updateLeadStatus}
                onRefresh={reloadLeads}
              />
            )}

            {activeTab === 'newsletter' && (
              <NewsletterTab onDelete={openDeleteDialog} />
            )}

            {activeTab === 'currency' && <CurrencyTab />}

            {activeTab === 'consultations' && (
              <ConsultationsTab
                consultations={consultations}
                onDelete={openDeleteDialog}
                onRefresh={reloadConsultations}
                onGmailReply={openGmailReply}
              />
            )}

            {activeTab === 'blogs' && (
              <BlogsTab
                blogs={blogs}
                onDelete={openDeleteDialog}
                onRefresh={reloadBlogs}
                editingId={editingBlogId}
                onCancelEdit={() => setEditingBlogId(null)}
                onGoToList={() => router.push('/admin/blogs')}
              />
            )}

            {activeTab === 'portfolio' && (
              <PortfolioTab
                projects={projects}
                onDelete={openDeleteDialog}
                onRefresh={reloadProjects}
                editingSlug={editingProjectSlug}
                onCancelEdit={() => setEditingProjectSlug(null)}
                onGoToList={() => router.push('/admin/portfolio')}
              />
            )}

            {activeTab === 'services' && (
              <ServicesTab
                services={services}
                onDelete={openDeleteDialog}
                onRefresh={reloadServices}
                editingId={editingServiceId}
                onCancelEdit={() => setEditingServiceId(null)}
                onGoToList={() => router.push('/admin/services')}
              />
            )}

            {activeTab === 'team' && (
              <TeamTab
                members={teamMembers}
                onDelete={openDeleteDialog}
                onRefresh={reloadTeam}
                editingId={editingTeamId}
                onCancelEdit={() => setEditingTeamId(null)}
                onGoToList={() => router.push('/admin/team')}
              />
            )}

            {activeTab === 'testimonials' && (
              <TestimonialsTab
                reviews={reviews}
                onDelete={openDeleteDialog}
                onRefresh={reloadReviews}
              />
            )}

            {activeTab === 'careers' && (
              <CareersTab
                vacancies={vacancies}
                applications={applications}
                onDelete={openDeleteDialog}
                onViewDetails={openDetailDialog}
                onRefresh={async () => { await reloadVacancies(); await reloadApplications(); }}
                editingId={editingVacancyId}
                onCancelEdit={() => setEditingVacancyId(null)}
                onGoToList={() => router.push('/admin/careers')}
              />
            )}

          </div>
          </main>
        </div>

      </div>{/* end lg:flex wrapper */}

      {/* ══════════════════════════════════════════════════
          LOGOUT CONFIRMATION DIALOG
      ══════════════════════════════════════════════════ */}
      <Dialog open={logoutDialog} onOpenChange={(open) => { if (!open && !logoutBusy) setLogoutDialog(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="w-4 h-4 text-red-500" />
              Sign out?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out of the admin panel?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setLogoutDialog(false)}
              disabled={logoutBusy}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmLogout}
              disabled={logoutBusy}
              className="gap-2"
            >
              {logoutBusy
                ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <LogOut className="w-3.5 h-3.5" />
              }
              {logoutBusy ? 'Signing out...' : 'Yes, sign out'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════
          DELETE DIALOG
      ══════════════════════════════════════════════════ */}
      <Dialog open={!!deleteDialog} onOpenChange={(open) => { if (!open && !deleteBusy) setDeleteDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{deleteDialog?.title}</DialogTitle>
            <DialogDescription>{deleteDialog?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteDialog(null)} disabled={deleteBusy}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteBusy} className="gap-2">
              {deleteBusy && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {deleteDialog?.confirmLabel || 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════
          DETAIL DIALOG
      ══════════════════════════════════════════════════ */}
      <Dialog open={!!detailDialog} onOpenChange={(open) => { if (!open) setDetailDialog(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailDialog?.title}</DialogTitle>
            <DialogDescription>{detailDialog?.subtitle}</DialogDescription>
          </DialogHeader>
          {detailDialog && (
            <div className="space-y-3 mt-2">
              {detailDialog.fields.map(({ label, value }) => (
                <div key={label} className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                  <span className="text-gray-900 font-mono text-xs uppercase tracking-wider pt-0.5">{label}</span>
                  <span className="text-gray-600 break-all">{value}</span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-3 space-y-1.5">
                <span className="text-gray-900 font-mono text-xs uppercase tracking-wider">
                  {detailDialog.messageLabel}
                </span>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {detailDialog.message}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDetailDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}