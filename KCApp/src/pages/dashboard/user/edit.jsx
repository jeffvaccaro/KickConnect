import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'src/routes/hooks';
import { CONFIG } from 'src/config-global';
import { UserEditView } from 'src/sections/user/view';
import userService from '../../../service/userService';
import roleService from '../../../service/roleService';

// ----------------------------------------------------------------------

const metadata = { title: `User edit | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { id = '' } = useParams();
  const [currentUser, setCurrentUser] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  useEffect(() => {
    // Fetch or set currentUser here
    userService.getUserById(id).then(user => setCurrentUser(user));
    roleService.getRoles().then(r => {
      //console.log(r, 'Roles fetched from roleService'); // Log the response
      setAllRoles(r);
    });
  }, [id]);

  useEffect(() => {
    console.log(allRoles,'allRoles - edit.jsx');
  }, [allRoles]);

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <UserEditView user={currentUser} roles={allRoles} />
    </>
  );
}
