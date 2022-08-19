import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../../App';
import Button, { ButtonType } from '../../../components/Button';
import UserService from '../../../services/User';

export default function SiteAdminHeader() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const logoutOfUser = async () => {
    // Log out of other user's dashboard and return admin back to their own dashboard
    localStorage.removeItem('userAuthToken');
    const curUser = await UserService.getUser();
    navigate('/');
    setUser(curUser);
  };

  return (
    <div className="fixed top-0 flex items-center justify-center space-x-4 w-full h-12 text-t-1 bg-b-2 z-30">
      <p>You are currently viewing {user?.name || ''}'s dashboard</p>
      <Button type={ButtonType.Link} onClick={logoutOfUser}>
        Log out of user
      </Button>
    </div>
  );
}
