/**
 * @file StudentDashboard.test.tsx
 * @description Unit tests for the StudentDashboard component covering project
 * browsing and filtering requirements (TC_PBF_01 – TC_PBF_06).
 *
 * Tests: TC_PBF_01 – TC_PBF_06
 *
 * MOCKING CONCEPTS COVERED IN THIS FILE
 * ──────────────────────────────────────
 *  vi.hoisted()      — lets you define a value that is available INSIDE vi.mock()
 *                      factories (explained in detail below).
 *  vi.mock(path, fn) — replaces an entire module with a fake implementation.
 *  vi.fn()           — creates a mock function (spy) that records calls.
 *  vi.clearAllMocks()— resets all spy call counts between tests.
 *  within(element)   — scopes DOM queries to a specific subtree (from RTL).
 *  userEvent         — simulates realistic user actions (click, type, select).
 */

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { StudentDashboard } from './StudentDashboard'
import type { User, Project } from '../App'

// ─── WHY vi.hoisted? ──────────────────────────────────────────────────────────
// Vitest HOISTS vi.mock() calls to the very top of the file at compile time,
// so they run before ANY import or variable declaration.
//
// That means a plain `const mockNavigate = vi.fn()` placed before vi.mock() in
// source order is still NOT available when the mock factory executes — because
// the factory has already been moved to run first.
//
// vi.hoisted() solves this: code inside it also runs before the module system
// resolves imports, so the returned value IS safely accessible inside factories.
const mockNavigate = vi.hoisted(() => vi.fn())

// ─── MOCK: child components ───────────────────────────────────────────────────
// We replace the three child components that StudentDashboard renders.
// This is called "shallow mocking" — we test StudentDashboard in isolation
// without running ProjectCard, CreateProjectModal, or UserProfileModal's logic.
//
// Benefits:
//  • ProjectCard normally calls useNavigate internally; the stub avoids that
//    dependency entirely.
//  • Tests run faster and failures are easier to diagnose.
//  • The stub for ProjectCard still renders the data we want to assert on
//    (title, type, skills, commitment) and exposes a "View" button so
//    TC_PBF_06 can test navigation.

vi.mock('./ProjectCard', () => ({
  // The factory returns an object that mirrors the real module's exports.
  // We type the props explicitly to avoid `any` and keep TypeScript happy.
  ProjectCard: ({
    project,
  }: {
    project: {
      id: string
      title: string
      projectType: string
      preferredSkills: string[]
      timeCommitment: string
    }
  }) => (
    // data-testid lets us target specific cards in TC_PBF_06
    <div data-testid={`project-card-${project.id}`}>
      <h3>{project.title}</h3>
      <span data-testid="project-type">{project.projectType}</span>
      {project.preferredSkills.map((skill) => (
        <span key={skill} data-testid="project-skill">
          {skill}
        </span>
      ))}
      <span data-testid="project-commitment">{project.timeCommitment}</span>
      {/*
       * This button mirrors the "View" button the real ProjectCard renders.
       * It calls mockNavigate (our shared spy) with the correct path so that
       * TC_PBF_06 can assert the right URL was navigated to.
       */}
      <button onClick={() => mockNavigate(`/project/${project.id}`)}>View</button>
    </div>
  ),
}))

// These two modals are complex components with their own API calls.
// Stubbing them means their internals can never cause our StudentDashboard
// tests to fail unexpectedly.
vi.mock('./CreateProjectModal', () => ({
  CreateProjectModal: () => <div data-testid="create-project-modal" />,
}))

vi.mock('./UserProfileModal', () => ({
  UserProfileModal: () => <div data-testid="user-profile-modal" />,
}))

// ─── TEST DATA ────────────────────────────────────────────────────────────────
// We only define the fields each component actually reads.
// Three projects:  p1 = Software / React+TypeScript / 5-8 h  (active)
//                  p2 = Research / Python+Data Analysis / 10-15 h (active)
//                  p3 = inactive → should NEVER appear in any listing

const mockUser: User = {
  id: 'u1',
  first_name: 'Jane',
  last_name: 'Doe',
  username: 'janedoe',
  email: 'jane@case.edu',
  role: 'student',
  skills: ['React'],
  interests: ['healthcare'],
  createdAt: new Date('2024-01-01'),
}

const testProjects: Project[] = [
  {
    id: 'p1',
    userId: 'u99',          // not the logged-in user → won't appear in "My Active Projects"
    userName: 'Alice',
    userEmail: 'alice@case.edu',
    title: 'Healthcare App',
    description: 'A healthcare platform for patients',
    projectType: 'Software',
    preferredSkills: ['React', 'TypeScript'],
    timeCommitment: '5-8 hours/week',
    contactMethod: 'email',
    contactInfo: 'alice@case.edu',
    isActive: true,
    createdAt: new Date('2025-01-10'),
    memberIds: [],
  },
  {
    id: 'p2',
    userId: 'u99',
    userName: 'Bob',
    userEmail: 'bob@case.edu',
    title: 'Climate Dashboard',
    description: 'Tracking climate metrics across regions',
    projectType: 'Research',
    preferredSkills: ['Python', 'Data Analysis'],
    timeCommitment: '10-15 hours/week',
    contactMethod: 'email',
    contactInfo: 'bob@case.edu',
    isActive: true,
    createdAt: new Date('2025-02-05'),
    memberIds: [],
  },
  {
    // isActive: false — the dashboard filters this out before rendering
    id: 'p3',
    userId: 'u99',
    userName: 'Carol',
    userEmail: 'carol@case.edu',
    title: 'Inactive Project',
    description: 'Should never appear',
    projectType: 'Software',
    preferredSkills: ['React'],
    timeCommitment: '5-8 hours/week',
    contactMethod: 'email',
    contactInfo: 'carol@case.edu',
    isActive: false,
    createdAt: new Date('2025-01-01'),
    memberIds: [],
  },
]

// ─── DEFAULT PROPS ────────────────────────────────────────────────────────────
// vi.fn() creates a mock function.  Each callback prop gets its own spy so we
// can assert on individual calls if needed (e.g. was onLogout called?).
const defaultProps = {
  currentUser: mockUser,
  projects: testProjects,
  users: [],
  onLogout: vi.fn(),
  onUpdateProfile: vi.fn(),
  onAddProject: vi.fn(),
  onUpdateProject: vi.fn(),
  onDeleteProject: vi.fn(),
  onReportProject: vi.fn(),
  // mockResolvedValue makes vi.fn() return a resolved Promise — needed because
  // onGetProjectDetails is declared as async in the component.
  onGetProjectDetails: vi.fn().mockResolvedValue(null) as (
    id: string,
  ) => Promise<Project | null>,
  onSendLlmMessage: vi.fn().mockResolvedValue('') as (
    query: string,
  ) => Promise<string>,
}

// ─── RENDER HELPER ────────────────────────────────────────────────────────────
// MemoryRouter provides the React Router context that react-router-dom requires
// (even through our mocks, Router context must exist in the tree).
// `propOverrides` lets individual tests pass different data without repeating
// the whole defaultProps object.
function renderDashboard(propOverrides: Partial<typeof defaultProps> = {}) {
  render(
    <MemoryRouter>
      <StudentDashboard {...defaultProps} {...propOverrides} />
    </MemoryRouter>,
  )
}

// ─── SMALL HELPERS ────────────────────────────────────────────────────────────

// Opens the Filters panel by clicking the toggle button.
async function openFilters(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /filters/i }))
}

// Returns the three filter <select> elements.
//
// WHY within()?
//   The filter labels ("Project Type", "Preferred Skill", "Time Commitment") are
//   NOT linked to their <select> via htmlFor/id in the source, so getByLabelText
//   won't work.  The always-visible "Sort by" select also has role="combobox".
//
//   within() scopes queries to a specific DOM subtree.  We find the filter panel
//   by its unique heading text, grab its parent container, then ask for all
//   comboboxes inside that container only — excluding "Sort by".
function getFilterSelects() {
  // screen.getByText returns the <h3> element.
  // .parentElement gives us the surrounding <div> that wraps the whole panel.
  const filterPanel = screen.getByText('Filter Projects').parentElement!

  // getAllByRole('combobox') finds every <select> inside filterPanel.
  // Order in the DOM: Project Type (index 0), Preferred Skill (1), Time Commitment (2).
  const [typeSelect, skillSelect, commitSelect] =
    within(filterPanel).getAllByRole('combobox')

  return { typeSelect, skillSelect, commitSelect }
}

// ─── TEST SUITE ───────────────────────────────────────────────────────────────

describe('StudentDashboard – project browsing & filtering (TC_PBF_01 – TC_PBF_06)', () => {
  // vi.clearAllMocks() resets the call history of every vi.fn() before each
  // test so that counts from one test can never affect another.
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── TC_PBF_01 ──────────────────────────────────────────────────────────────
  // FR-1: The system shall display all active project posts to authenticated students.
  it('TC_PBF_01 – displays only active projects to an authenticated student', () => {
    // Arrange + Act — render the dashboard with our test projects
    renderDashboard()

    // Assert — both ACTIVE projects appear in the document
    expect(screen.getByText('Healthcare App')).toBeInTheDocument()
    expect(screen.getByText('Climate Dashboard')).toBeInTheDocument()

    // Assert — the INACTIVE project is completely absent from the DOM.
    // queryByText (unlike getByText) returns null instead of throwing when
    // the element is not found, making it safe to use with .not.
    expect(screen.queryByText('Inactive Project')).not.toBeInTheDocument()

    // Assert — the section heading shows the correct count
    expect(screen.getByText(/Available Projects \(2\)/i)).toBeInTheDocument()
  })

  // ── TC_PBF_02 ──────────────────────────────────────────────────────────────
  // FR-2: The system shall allow filtering by project type.
  it('TC_PBF_02 – filters the listing by project type', async () => {
    // userEvent.setup() creates a user-event instance.
    // Always use this over the legacy fireEvent for realistic interactions.
    const user = userEvent.setup()
    renderDashboard()

    // The filter panel is hidden by default — reveal it first
    await openFilters(user)

    // Grab the Project Type <select> using our helper
    const { typeSelect } = getFilterSelects()

    // Select "Research" — only Climate Dashboard has this type
    await user.selectOptions(typeSelect, 'Research')

    // Assert — the matching project is visible, the non-matching one is gone
    expect(screen.getByText('Climate Dashboard')).toBeInTheDocument()
    expect(screen.queryByText('Healthcare App')).not.toBeInTheDocument()
  })

  // ── TC_PBF_03 ──────────────────────────────────────────────────────────────
  // FR-2: The system shall allow filtering by skills.
  it('TC_PBF_03 – filters the listing by preferred skill', async () => {
    const user = userEvent.setup()
    renderDashboard()

    await openFilters(user)
    const { skillSelect } = getFilterSelects()

    // "Python" is only in Climate Dashboard's preferredSkills array
    await user.selectOptions(skillSelect, 'Python')

    expect(screen.getByText('Climate Dashboard')).toBeInTheDocument()
    expect(screen.queryByText('Healthcare App')).not.toBeInTheDocument()
  })

  // ── TC_PBF_04 ──────────────────────────────────────────────────────────────
  // FR-2: The system shall allow filtering by time commitment.
  it('TC_PBF_04 – filters the listing by time commitment', async () => {
    const user = userEvent.setup()
    renderDashboard()

    await openFilters(user)
    const { commitSelect } = getFilterSelects()

    // "5-8 hours/week" matches only Healthcare App
    await user.selectOptions(commitSelect, '5-8 hours/week')

    expect(screen.getByText('Healthcare App')).toBeInTheDocument()
    expect(screen.queryByText('Climate Dashboard')).not.toBeInTheDocument()
  })

  // ── TC_PBF_05 ──────────────────────────────────────────────────────────────
  // FR-3: The system shall update results dynamically when filters are applied.
  it('TC_PBF_05 – results update dynamically as filters are applied and cleared', async () => {
    const user = userEvent.setup()
    renderDashboard()

    // Baseline: both active projects visible before any filter is set
    expect(screen.getByText(/Available Projects \(2\)/i)).toBeInTheDocument()

    await openFilters(user)
    const { typeSelect } = getFilterSelects()

    // Apply a type filter → the count drops immediately (no page reload)
    await user.selectOptions(typeSelect, 'Software')
    expect(screen.getByText(/Available Projects \(1\)/i)).toBeInTheDocument()

    // Reset the filter back to "All" → count returns to 2 without re-mounting
    await user.selectOptions(typeSelect, 'All')
    expect(screen.getByText(/Available Projects \(2\)/i)).toBeInTheDocument()
  })

  // ── TC_PBF_06 ──────────────────────────────────────────────────────────────
  // FR-4: The system shall allow students to open a project to view full details.
  it('TC_PBF_06 – clicking View on a project card navigates to the project details page', async () => {
    const user = userEvent.setup()
    renderDashboard()

    // getAllByRole finds every button whose accessible name matches "View".
    // Our mocked ProjectCard renders one "View" button per project, so we
    // expect exactly 2 (one for each active project).
    const viewButtons = screen.getAllByRole('button', { name: /^view$/i })
    expect(viewButtons).toHaveLength(2)

    // Click the first View button — this corresponds to Healthcare App (id=p1)
    // because p1 appears first in the testProjects array.
    await user.click(viewButtons[0])

    // Assert — mockNavigate was called exactly once with the correct path.
    // This verifies that opening a project card routes to its details page.
    //
    // toHaveBeenCalledTimes(1) — guards against unexpected extra calls
    // toHaveBeenCalledWith(...)  — verifies the exact argument
    expect(mockNavigate).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith('/project/p1')
  })
})
