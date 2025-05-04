import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import styled from 'styled-components';

const NavContainer = styled.nav`
  background-color: #fff;
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

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
    position: absolute;
    flex-direction: column;
    top: 70px;
    left: 0;
    right: 0;
    background-color: white;
    box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    z-index: 10;
  }
`;

const NavItem = styled(NavLink)`
  color: #7f8c8d;
  font-weight: 600;
  transition: color 0.3s ease;

  &:hover, &.active {
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

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <NavContainer>
      <LogoLink to="/">
        <LogoImage src="/Textify.png" alt="Txtify Logo" />
      </LogoLink>
      <MenuButton onClick={toggleMenu}>
        {isMenuOpen ? '✕' : '☰'}
      </MenuButton>
      <NavLinks isOpen={isMenuOpen}>
        <NavItem to="/" end>Home</NavItem>
        <NavItem to="/reviews">Reviews</NavItem>
        <NavItem to="/about">About</NavItem>
      </NavLinks>
    </NavContainer>
  );
};

export default Navbar; 