import { Route, Routes } from 'react-router-dom'
import { LandingPage } from '@/landing/pages/LandingPage'
import { LoginPage } from '@/auth/pages/LoginPage'
import { RegisterOrganizationPage } from '@/organizations/pages/RegisterOrganizationPage'
import { LinkedInSignupPage } from '@/organizations/pages/LinkedInSignupPage'
import { OrganizationPage } from '@/organizations/pages/OrganizationPage'
import { DashboardLayout } from '@/dashboard/layouts/DashboardLayout'
import { DashboardPage } from '@/dashboard/pages/DashboardPage'
import { CandidatesPage } from '@/candidates/pages/CandidatesPage'
import { ApplicationsPage } from '@/applications/pages/ApplicationsPage'
import { InterviewsPage } from '@/interviews/pages/InterviewsPage'
import { JobsPage } from '@/jobs/pages/JobsPage'
import { JobBoardPage } from '@/jobs/pages/JobBoardPage'
import { PendingApprovalPage } from '@/organizations/pages/PendingApprovalPage'
import { RegistrationRejectedPage } from '@/organizations/pages/RegistrationRejectedPage'
import { RequireOrganization } from '@/auth/components/RequireOrganization'
import { RequireAdmin } from '@/admin/components/RequireAdmin'
import { AdminLayout } from '@/admin/layouts/AdminLayout'
import { AdminLoginPage } from '@/admin/pages/AdminLoginPage'
import { AdminOrganizationsPage } from '@/admin/pages/AdminOrganizationsPage'
import { AdminOrganizationDetailPage } from '@/admin/pages/AdminOrganizationDetailPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/jobs" element={<JobBoardPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterOrganizationPage />} />
      <Route path="/signup/linkedin" element={<LinkedInSignupPage />} />
      <Route path="/pending-approval" element={<PendingApprovalPage />} />
      <Route path="/registration-rejected" element={<RegistrationRejectedPage />} />

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOrganizationsPage />} />
          <Route path="organizations/:organizationId" element={<AdminOrganizationDetailPage />} />
        </Route>
      </Route>

      <Route element={<RequireOrganization />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="candidates" element={<CandidatesPage />} />
          <Route path="organization" element={<OrganizationPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="interviews" element={<InterviewsPage />} />
          <Route path="jobs" element={<JobsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
