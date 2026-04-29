/**
 * @file UserProfileModal.test.tsx
 * @description Unit tests for the UserProfileModal component covering profile
 * viewing and editing requirements (TC_UP_01 – TC_UP_07).
 *
 * Tests: TC_UP_01 – TC_UP_07
 *
 * NEW MOCKING CONCEPT IN THIS FILE (vs StudentDashboard tests)
 * ─────────────────────────────────────────────────────────────
 *  vi.stubGlobal('fetch', mockFn)
 *    — Replaces the browser's built-in fetch() function with our own spy.
 *      The component calls fetch() inside a useEffect to load profile data
 *      from the backend.  In tests we never want real HTTP requests, so we
 *      swap fetch out for a function we fully control.
 *
 *      Because fetch returns a Promise that resolves to a Response object,
 *      our fake must mimic that shape exactly:
 *        { json: () => Promise.resolve({ ... your data ... }) }
 *
 *  mockFetch.mockResolvedValueOnce(...)
 *    — Makes the spy return a specific value for exactly ONE call, then
 *      revert to the default.  Useful in TC_UP_07 where we need the API
 *      to return real profile data for just that one test.
 *
 *  waitFor / findBy*
 *    — Because useEffect runs asynchronously after the first render, we
 *      must WAIT for the mock fetch to resolve before making assertions.
 *      waitFor() keeps retrying until its callback passes (or times out).
 *      findBy* queries are the same idea built into RTL selectors.
 *
 *  expect.objectContaining({ ... })
 *    — Passes if the received object contains AT LEAST the listed keys/values.
 *      Useful when onSave is called with the full User object but we only
 *      want to assert on the fields we changed.
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserProfileModal } from './UserProfileModal'
import type { User } from '../App'

// ─── MOCK: global fetch ───────────────────────────────────────────────────────
// vi.stubGlobal replaces window.fetch for every test in this file.
// We do this once at module level so ALL tests share the same spy.
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// ─── TEST USER ────────────────────────────────────────────────────────────────
// A realistic User object that mirrors what the real backend sends down.
const mockUser: User = {
  id: 'u1',
  first_name: 'Jane',
  last_name: 'Doe',
  username: 'janedoe',
  email: 'jane@case.edu',
  role: 'student',
  major: 'Computer Science',
  skills: ['Python', 'SQL'],
  interests: ['AI', 'Healthcare'],
  availability: '5-10 hours/week',
  preferred_contact_method: 'Email',
  active_project_notifications: true,
  project_expiration_notifications: true,
  weekly_update_notifications: false,
  createdAt: new Date('2024-01-01'),
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Renders the modal with a user merged from mockUser + any overrides,
 * and returns the vi.fn() spies so tests can assert on them.
 */
function renderModal(userOverride: Partial<User> = {}) {
  const onClose = vi.fn()
  const onSave = vi.fn()
  render(
    <UserProfileModal
      user={{ ...mockUser, ...userOverride }}
      onClose={onClose}
      onSave={onSave}
    />,
  )
  return { onClose, onSave }
}

// ─── SETUP / TEARDOWN ────────────────────────────────────────────────────────

beforeEach(() => {
  // Reset spy call counts between tests so one test's calls don't affect the next.
  vi.clearAllMocks()

  /*
   * DEFAULT fetch behaviour for most tests:
   * Return { success: false } so the useEffect does NOT overwrite the
   * prop-supplied field values.  Tests that need real API data override
   * this with mockFetch.mockResolvedValueOnce(...) before rendering.
   *
   * The fake response shape must match what the real fetch Response looks like:
   *   { json: () => Promise.resolve(data) }
   */
  mockFetch.mockResolvedValue({
    json: () => Promise.resolve({ success: false }),
  })
})

// ─── TEST SUITE ───────────────────────────────────────────────────────────────

describe('UserProfileModal – user profile management (TC_UP_01 – TC_UP_07)', () => {
  // ── TC_UP_01 ──────────────────────────────────────────────────────────────
  // FR-1: Allow students to create and edit personal profiles.
  // Scenario: user fills in all fields with fresh data and saves.
  it('TC_UP_01 – saves a new profile with all valid fields', async () => {
    const user = userEvent.setup()

    // Render with blanked-out prop data so the fields start empty
    const { onSave, onClose } = renderModal({
      first_name: '',
      last_name: '',
      major: '',
      skills: [],
      interests: [],
      availability: '',
    })

    // Wait for the useEffect fetch to settle before interacting.
    // The fetch returns { success: false } here so nothing changes in the form.
    await waitFor(() => expect(mockFetch).toHaveBeenCalled())

    // ── Fill every field ──────────────────────────────────────────────────
    // getByLabelText finds an input by its associated <label> text.
    // This works because each input has a matching htmlFor/id pair in the JSX.
    await user.type(screen.getByLabelText(/first name/i), 'Brooke')
    await user.type(screen.getByLabelText(/last name/i), 'Brocker')
    await user.type(screen.getByLabelText(/major/i), 'Computer Science')
    await user.type(screen.getByLabelText(/skills \(comma-separated\)/i), 'Python, SQL')
    await user.type(screen.getByLabelText(/interests \(comma-separated\)/i), 'AI, Healthcare')
    await user.type(screen.getByLabelText(/availability/i), '5-10 hours/week')
    await user.selectOptions(screen.getByLabelText(/preferred contact method/i), 'Email')

    // ── Verify email is pre-filled and read-only ──────────────────────────
    // The email field is rendered with `disabled` so users cannot change it.
    const emailInput = screen.getByLabelText(/cwru email/i)
    expect(emailInput).toHaveValue('jane@case.edu')
    expect(emailInput).toBeDisabled()

    // ── Save ──────────────────────────────────────────────────────────────
    await user.click(screen.getByRole('button', { name: /save profile/i }))

    // onSave should be called once with the typed values.
    // expect.objectContaining() means "the call argument must include AT LEAST
    // these keys — other keys are allowed too".
    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: 'Brooke',
        last_name: 'Brocker',
        major: 'Computer Science',
        skills: ['Python', 'SQL'],        // the component splits the comma string for us
        interests: ['AI', 'Healthcare'],
        availability: '5-10 hours/week',
        preferred_contact_method: 'Email',
        email: 'jane@case.edu',           // email must stay unchanged
      }),
    )

    // onClose is called right after saving so the modal disappears
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // ── TC_UP_02 ──────────────────────────────────────────────────────────────
  // FR-3: Allow students to edit all profile fields except email.
  // Scenario: user has an existing profile, updates only the skills field.
  it('TC_UP_02 – updating skills leaves all other fields unchanged', async () => {
    const user = userEvent.setup()

    // Render with the full default mock user (has existing Python, SQL skills)
    const { onSave } = renderModal()
    await waitFor(() => expect(mockFetch).toHaveBeenCalled())

    // Clear the existing skills and type the updated value
    const skillsInput = screen.getByLabelText(/skills \(comma-separated\)/i)
    await user.clear(skillsInput)
    await user.type(skillsInput, 'Python, SQL, R')

    await user.click(screen.getByRole('button', { name: /save profile/i }))

    // Skills should now include R
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        skills: ['Python', 'SQL', 'R'],
      }),
    )

    // Other fields should be exactly as they were in mockUser
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: 'Jane',
        last_name: 'Doe',
        major: 'Computer Science',
        email: 'jane@case.edu',
      }),
    )
  })

  // ── TC_UP_03 ──────────────────────────────────────────────────────────────
  // FR-4: Prevent modification of the email field.
  // Scenario: the email input renders but is not editable.
  it('TC_UP_03 – email field is visible but disabled', () => {
    // No async needed here — we are only checking the initial render state.
    renderModal()

    const emailInput = screen.getByLabelText(/cwru email/i)

    // toBeDisabled() checks for the HTML `disabled` attribute.
    // A disabled input cannot be focused or typed into by the user.
    expect(emailInput).toBeDisabled()

    // The correct address should still be displayed
    expect(emailInput).toHaveValue('jane@case.edu')
  })

  // ── TC_UP_04 ──────────────────────────────────────────────────────────────
  // FR-2: Validate required profile fields.
  // Scenario: user leaves First Name blank and tries to save.
  it('TC_UP_04 – does not save when First Name is blank', async () => {
    const user = userEvent.setup()
    const { onSave } = renderModal()
    await waitFor(() => expect(mockFetch).toHaveBeenCalled())

    // Clear the required First Name field entirely
    const firstNameInput = screen.getByLabelText(/first name/i)
    await user.clear(firstNameInput)

    // Try to submit with the empty required field
    await user.click(screen.getByRole('button', { name: /save profile/i }))

    // Because First Name has the `required` attribute, the browser/JSDOM blocks
    // form submission.  handleSubmit is never called, so onSave stays at 0 calls.
    expect(onSave).not.toHaveBeenCalled()

    // toBeInvalid() checks the HTML5 Constraint Validation API:
    // an empty `required` input has validity.valueMissing = true → invalid.
    expect(firstNameInput).toBeInvalid()
  })

  // ── TC_UP_05 ──────────────────────────────────────────────────────────────
  // FR-5: Allow students to configure email notification preferences.
  // Scenario: user explicitly sets all three toggles, then saves.
  it('TC_UP_05 – saves chosen notification preferences', async () => {
    const user = userEvent.setup()

    // Start with all three notifications OFF so we can turn them on/off
    const { onSave } = renderModal({
      active_project_notifications: false,
      project_expiration_notifications: false,
      weekly_update_notifications: true,   // start ON so we can turn it off
    })
    await waitFor(() => expect(mockFetch).toHaveBeenCalled())

    // Enable "Receive email reminders for active projects"
    await user.click(
      screen.getByLabelText(/receive email reminders for active projects/i),
    )
    // Enable "Notify when project posts are about to expire"
    await user.click(
      screen.getByLabelText(/notify me when my project posts are about to expire/i),
    )
    // Disable "Send me weekly updates" (it was ON, clicking toggles it OFF)
    await user.click(
      screen.getByLabelText(/send me weekly updates/i),
    )

    await user.click(screen.getByRole('button', { name: /save profile/i }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        active_project_notifications: true,
        project_expiration_notifications: true,
        weekly_update_notifications: false,
      }),
    )
  })

  // ── TC_UP_06 ──────────────────────────────────────────────────────────────
  // FR-5: Allow students to update existing notification preferences.
  // Scenario: user changes two of the three notifications and saves.
  it('TC_UP_06 – updates individual notification preferences correctly', async () => {
    const user = userEvent.setup()

    // Start from a known state: active=ON, expiration=ON, weekly=OFF
    const { onSave } = renderModal({
      active_project_notifications: true,
      project_expiration_notifications: true,
      weekly_update_notifications: false,
    })
    await waitFor(() => expect(mockFetch).toHaveBeenCalled())

    // Turn OFF "active project notifications" (was ON)
    await user.click(
      screen.getByLabelText(/receive email reminders for active projects/i),
    )
    // Turn ON "weekly updates" (was OFF)
    await user.click(
      screen.getByLabelText(/send me weekly updates/i),
    )
    // Leave "project expiration" unchanged

    await user.click(screen.getByRole('button', { name: /save profile/i }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        active_project_notifications: false,   // changed
        project_expiration_notifications: true, // unchanged
        weekly_update_notifications: true,      // changed
      }),
    )
  })

  // ── TC_UP_07 ──────────────────────────────────────────────────────────────
  // FR-2: Store and display profile information fields.
  // Scenario: the modal loads and populates fields from the backend API.
  it('TC_UP_07 – displays profile data loaded from the API', async () => {
    /*
     * This test overrides the default fetch mock to return real profile data.
     * mockResolvedValueOnce applies only to the NEXT call to mockFetch.
     * After that one call the default (success: false) resumes.
     *
     * This is the key technique for testing components that fetch on mount:
     * control exactly what the API returns so you can assert exact field values.
     */
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          first_name: 'Brooke',
          last_name: 'Brocker',
          major: 'Computer Science',
          skills: ['Python', 'SQL'],
          interests: ['AI', 'Healthcare'],
          availability: '5-10 hours/week',
          preferred_contact_method: 'Email',
          active_project_notifications: true,
          project_expiration_notifications: false,
          weekly_update_notifications: true,
        }),
    })

    renderModal()

    /*
     * findByDisplayValue is the ASYNC version of getByDisplayValue.
     * It waits (polls) until an element with that value appears in the DOM.
     * This is necessary because the useEffect runs AFTER the initial render,
     * so fields start with prop values and only update once fetch resolves.
     *
     * We await the first field, then the rest use the synchronous getBy*
     * because we know the effect has completed once the first one passes.
     */
    expect(await screen.findByDisplayValue('Brooke')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Brocker')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Computer Science')).toBeInTheDocument()

    // Skills and interests are stored as arrays but displayed as comma strings
    expect(screen.getByDisplayValue('Python, SQL')).toBeInTheDocument()
    expect(screen.getByDisplayValue('AI, Healthcare')).toBeInTheDocument()
    expect(screen.getByDisplayValue('5-10 hours/week')).toBeInTheDocument()

    // Email is visible but not editable
    const emailInput = screen.getByLabelText(/cwru email/i)
    expect(emailInput).toHaveValue('jane@case.edu')
    expect(emailInput).toBeDisabled()

    // Verify the three notification checkboxes match the API-returned values
    expect(
      screen.getByLabelText(/receive email reminders for active projects/i),
    ).toBeChecked()
    expect(
      screen.getByLabelText(/notify me when my project posts are about to expire/i),
    ).not.toBeChecked()
    expect(
      screen.getByLabelText(/send me weekly updates/i),
    ).toBeChecked()
  })
})
