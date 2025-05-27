import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const NavContainer = styled.nav`
  background: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
`;

const LogoImage = styled.img`
  height: 40px;
  width: auto;
`;

const LeftNavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const RightNavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    display: ${({ $open }) => ($open ? 'flex' : 'none')};
    position: absolute;
    flex-direction: column;
    top: 70px;
    left: 0;
    right: 0;
    background: #fff;
    box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    z-index: 10;
  }
`;

const NavItem = styled(NavLink)`
  color: #7f8c8d;
  font-weight: 600;
  transition: color 0.3s;
  &.active,
  &:hover {
    color: #3498db;
  }
`;

const MenuButton = styled.button`
  display: none;
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  @media (max-width: 768px) {
    display: block;
  }
`;

const LoginButton = styled(Link)`
  background: #3498db;
  color: #fff;
  padding: 0.5rem 1.2rem;
  border-radius: 4px;
  font-weight: 600;
  text-decoration: none;
  margin-left: 2rem;
  transition: background 0.2s;
  &:hover {
    background: #217dbb;
  }
`;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const user = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <NavContainer>
      <LogoLink to="/">
        <LogoImage src="/Textify.png" alt="Txtify Logo" />
      </LogoLink>
      <MenuButton onClick={() => setOpen(!open)}>{open ? '✕' : '☰'}</MenuButton>
      <LeftNavLinks>
        <NavItem to="/" end>Home</NavItem>
        <NavItem to="/reviews">Reviews</NavItem>
        <NavItem to="/about">About</NavItem>
      </LeftNavLinks>
      <RightNavLinks>
        {user && <NavItem to="/dashboard">Dashboard</NavItem>}
        {user && <NavItem to="/console">Console</NavItem>}
        {user && <NavItem to="/settings">Settings</NavItem>}
        {user ? (
          <LoginButton as="button" onClick={handleLogout} style={{cursor: 'pointer'}}>Logout</LoginButton>
        ) : (
          <LoginButton to="/login">Login</LoginButton>
        )}
      </RightNavLinks>
    </NavContainer>
  );
}
