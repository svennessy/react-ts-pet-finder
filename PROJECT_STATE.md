App: Spot

Frontend
- Vite
- React
- TypeScript
- React Router

Backend
- Express
- Prisma
- Supabase Postgres
- Render deployment target

Current Features
- Home page
- Nearby map page
- Lost/found pet reports
- Detail drawer
- Create report
- Edit report
- Delete report
- Resolve report
- Sightings
- Favorites (in progress)

Folder Structure
src/
  api/
  app/
  components/
    auth/
    favorites/
    home/
    layout/
    nearby/
    pets/
    post-pet/
    ui/
  hooks/
    auth/
    favorites/
    nearby/
  pages/
  types/
  utils/

Important Rules
- No features folder.
- Components grouped by domain.
- Hooks grouped by domain.
- Shared types live in src/types.
- Shared utils live in src/utils.

Current Work
- Favorites system
  - backend routes exist
  - prisma model exists
  - api/favorites.ts exists
  - useFavorites hook exists
  - PetCard heart button exists
  - PetDetailDrawer heart button exists
  - Favorites page exists

Next Priorities
1. Finish favorites UX
2. Bulletin page backed by real sightings
3. User profile dashboard
4. Notifications
5. Real-time updates