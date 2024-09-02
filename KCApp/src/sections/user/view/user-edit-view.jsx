import { paths } from 'src/routes/paths';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { UserNewEditForm } from '../user-new-edit-form';

// ----------------------------------------------------------------------

export function UserEditView({ user , roles }) {

  console.log('UserEditView - user:', user);
  console.log('UserEditView - roles:', roles);
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'User', href: paths.dashboard.user.root },
          { name: user?.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <UserNewEditForm user={user[0]} roles={roles} />
    </DashboardContent>
  );
}
