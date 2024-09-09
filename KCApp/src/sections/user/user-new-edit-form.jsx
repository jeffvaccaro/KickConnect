import { z as zod } from 'zod';
import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { fData } from 'src/utils/format-number';
import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { useEffect, useState } from 'react';

import userService from '../../service/userService';

// ----------------------------------------------------------------------
//const res = await axios.post(endpoints.auth.signIn, params);
export const NewUserSchema = zod.object({
  photoURL: zod.string(),
  name: zod.string().min(1, { message: 'Name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
    phone: schemaHelper.phoneNumber({ isValidPhoneNumber }),
  isActive: zod.number(),
  isPasswordReset: zod.boolean(),
  roleId: zod.number(),
});

// ----------------------------------------------------------------------

export function UserNewEditForm({ user, roles }) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [photoURL, setPhotoURL] = useState('');
  const [file, setFile] = useState(null);





  const convertBooleanToNumber = (value) => (value ? 0 : 1);
  const convertNumberToBoolean = (value) => value === 1;
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
      userId: currentUser?.userId,
      accountId: currentUser?.accountId,
      isActive: currentUser?.isActive ?? 1,
      isPasswordReset: convertNumberToBoolean(currentUser?.isPasswordReset ?? 0),
      photoURL: apiUrl + currentUser?.photoURL || null,
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone ? `+1${currentUser.phone}` : '',
      roleId: Number(currentUser?.roleId) || '',
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
    formState: { isSubmitting, errors },
  } = methods;

  useEffect(() => {
    if (currentUser) {
      // console.log('Resetting form with defaultValues:', defaultValues);
      reset(defaultValues);
    }
  }, [currentUser, reset, defaultValues]);

  useEffect(() => {
    console.log('Form values:', watch());
    console.log('Form errors:', errors);
  }, [watch, errors]);

  // useEffect(() => {
  //   console.log('Current user isActive:', currentUser?.isActive);
  // }, [currentUser]);

  // useEffect(() => {
  //   console.log('Initial isActive:', defaultValues.isActive);
  // }, [defaultValues.isActive]);

  // useEffect(() => {
  //   console.log('Current isActive:', values.isActive);
  // }, [values.isActive]);


  const values = watch();

  const cleanPhoneNumber = (phone) => {
    return phone.startsWith('+1') ? phone.substring(2) : phone;
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
    // setFileName(file.name);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log("data:", data);

      await new Promise((resolve) => setTimeout(resolve, 500));
  
      // Convert isPasswordReset to a number
      data.isPasswordReset = data.isPasswordReset ? 1 : 0;
  
      // Clean the phone number
      const cleanedPhone = cleanPhoneNumber(data.phone);
  
      // Create a FormData object to handle file upload
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('accountcode', data.accountcode);
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', cleanedPhone);
      formData.append('phone2', data.phone2);
      formData.append('password', data.password);
      formData.append('roleId', data.roleId);
  
      // Make the API call
      console.log("formData", formData);
      const response = await updateUsers(formData);
      console.log('Response:', response);
  
      reset();
      toast.success(currentUser ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.user.list);
  
    } catch (error) {
      console.error(error);
    }
  });
  
  
  

  const updateUsers = async (mergedData) => {
    try {
      console.log("mergedData", mergedData);
      await userService.updateUser(mergedData);
    } catch (error) {
      console.error('Error updating Users:', error);
    }
  };

  

    return (
    <Form encType="multipart/form-data" methods={methods}  onSubmit={methods.handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
          {currentUser && (
            <Label
              color={
                (values.isActive === 1 && 'success') ||
                (values.isActive === 0 && 'error') ||
                'warning'
              }
              sx={{ position: 'absolute', top: 24, right: 24 }}
            >
              {values.isActive === 1 ? 'Active' : values.isActive === 0 ? 'Inactive' : 'Unknown'}
            </Label>
          )}

          <Box sx={{ mb: 5 }}>
            {/* <Field.UploadAvatar
                name="photoURL"
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
              /> */}

              <div className="App">
              <h2>Add Image:</h2>
              <input type="file" onChange={handleChange} name="photoURL"/>
              <img src={file} />
              </div>

            </Box>

            {currentUser && (
              <FormControlLabel labelPlacement="start"
                control={
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        {...field}
                        checked={field.value === 1}
                        onChange={(event) =>
                          field.onChange(event.target.checked ? 1 : 0)
                        }
                      />
                    )}
                  />
                }
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {values.isActive === 1 ? 'Active' : 'Inactive'}
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

          <Field.Switch
            name="isPasswordReset"
            labelPlacement="start"
            label={
              <>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Reset Password
                </Typography>
              </>
            }
            sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            checked={values.isPasswordReset === 1}
            onChange={(event) => {
              setFieldValue('isPasswordReset', event.target.checked ? 1 : 0);
            }}
          />
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
              <Field.Phone name="phone" label="Phone number" />
              <Field.Select
                name="roleId"
                label="Role type"
                control={control}
                options={allRoles.map(role => ({ key: role.roleId, value: role.roleId, label: role.roleDescription }))}
                onChange={(event) => {
                  const selectedRoleId = event.target.value;
                  methods.setValue('roleId', selectedRoleId); // Set the roleId field
                  console.log('Selected roleId:', selectedRoleId); // Log the selected roleId
                }}
              />
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
