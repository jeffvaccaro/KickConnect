import { z as zod } from 'zod';
import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { fData } from 'src/utils/format-number';
import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { useEffect, useState } from 'react';


// ----------------------------------------------------------------------
//const res = await axios.post(endpoints.auth.signIn, params);
export const NewUserSchema = zod.object({
  avatarUrl: schemaHelper.file({
    message: { required_error: 'Avatar is required!' },
  }),
  name: zod.string().min(1, { message: 'Name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  phoneNumber: schemaHelper.phoneNumber({ isValidPhoneNumber }),
  // country: schemaHelper.objectOrNull({
  //   message: { required_error: 'Country is required!' },
  // }),
  // address: zod.string().min(1, { message: 'Address is required!' }),
  // company: zod.string().min(1, { message: 'Company is required!' }),
  // state: zod.string().min(1, { message: 'State is required!' }),
  // city: zod.string().min(1, { message: 'City is required!' }),
  // role: zod.string().min(1, { message: 'Role is required!' }),
  // zipCode: zod.string().min(1, { message: 'Zip code is required!' }),
  // Not required
  status: zod.string(),
  // isVerified: zod.boolean(),
});

// ----------------------------------------------------------------------

export function UserNewEditForm({ user, roles }) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState([]);
  const [allRoles, setAllRoles] = useState([]);

  useEffect(() => {
    // console.log(user, 'user');
    // console.log(roles, 'roles');

    if (user) {
      setCurrentUser(user);
    }
    
    if (Array.isArray(roles)) {
      setAllRoles(roles);
    }
  }, [user, roles]);

  const defaultValues = useMemo(
    () => ({
      status: currentUser?.isActive ?? '0',
      avatarUrl: apiUrl + currentUser?.photoURL || null,
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phoneNumber: currentUser?.phone ? `+1${currentUser.phone}` : '',
      role: currentUser?.roleId || '',
    }),
    [currentUser]
  );

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentUser) {
      // console.log('Resetting form with defaultValues:', defaultValues);
      reset(defaultValues);
    }
  }, [currentUser, reset, defaultValues]);

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      toast.success(currentUser ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.user.list);
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  // useEffect(() => {
  //   console.log('Current user isActive:', currentUser?.isActive);
  // }, [currentUser]);

  // useEffect(() => {
  //   console.log('Initial status:', defaultValues.status);
  // }, [defaultValues.status]);

  // useEffect(() => {
  //   console.log('Current status:', values.status);
  // }, [values.status]);


  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
          {currentUser && (
            <Label
              color={
                (values.status === 0 && 'success') ||
                (values.status === -1 && 'error') ||
                'warning'
              }
              sx={{ position: 'absolute', top: 24, right: 24 }}
            >
              {values.status === 0 ? 'Active' : values.status === -1 ? 'Inactive' : 'Unknown'}
            </Label>
          )}

            <Box sx={{ mb: 5 }}>
              <Field.UploadAvatar
                name="avatarUrl"
                maxSize={3145728}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 3,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.disabled',
                    }}
                  >
                    Allowed *.jpeg, *.jpg, *.png, *.gif
                    <br /> max size of {fData(3145728)}
                  </Typography>
                }
              />
            </Box>

            {currentUser && (
              <FormControlLabel labelPlacement="start"
                control={
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        {...field}
                        checked={field.value === 0}
                        onChange={(event) =>
                          field.onChange(event.target.checked ? 0 : -1)
                        }
                      />
                    )}
                  />
                }
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {values.status === 0 ? 'Active' : 'Inactive'}
                    </Typography>
                  </>
                }
                sx={{
                  mx: 0,
                  mb: 3,
                  width: 1,
                  justifyContent: 'space-between',
                }}
              />
            )}
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <Field.Text name="name" label="Name" />
              <Field.Text name="email" label="Email address" />
              <Field.Phone name="phoneNumber" label="Phone number" />
              <Field.Select name="role" label="Role type" control={control} options={allRoles.map(role => ({ value: role.roleId, label: role.roleDescription }))}/>
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentUser ? 'Create user' : 'Save changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
