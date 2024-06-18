import { useContext, useState } from 'react';
import teste from '../../assets/teste.png';
import { Link, withRouter } from 'react-router-dom';
import { AuthContext } from '../../context/auth';
import { Dropdown, Modal, Button, Tooltip, Popover, Whisper } from 'rsuite';
import ExitIcon from '@rsuite/icons/Exit';
import UserIcon from '@rsuite/icons/legacy/User';

const Sidebar = ({ location, hideOnRoutes }) => {
    const { user, signed, signOut } = useContext(AuthContext);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const shouldRenderSidebar = signed && hideOnRoutes.includes(location.pathname);

    const handleOpenModal = () => {
        setShowLogoutModal(true);
    };

    const handleCloseModal = () => {
        setShowLogoutModal(false);
    };

    const handleConfirmLogout = () => {
        signOut();
        setShowLogoutModal(false);
    };

    return shouldRenderSidebar ? (
        <sidebar className="col-2 h-100 w-100 d-flex flex-column">
            <img src={teste} alt="teste" className="img-fluid px-3 py-4" />
            <ul className="p-0 m-0 flex-grow-1">
                <li>
                    <Link to="/agendamentos" className={location.pathname === '/agendamentos' ? 'active' : ''}>
                        <span className="mdi mdi-calendar-check"></span>
                        <text>Agendamentos</text>
                    </Link>
                </li>
                <li>
                    <Link to="/cliente" className={location.pathname === '/cliente' ? 'active' : ''}>
                        <span className="mdi mdi-account-multiple"></span>
                        <text>Clientes</text>
                    </Link>
                </li>
                <li>
                    <Link to="/servico" className={location.pathname === '/servico' ? 'active' : ''}>
                        <span className="mdi mdi-auto-fix"></span>
                        <text>Serviços</text>
                    </Link>
                </li>
                <li>
                    <Link to="/relatorio" className={location.pathname === '/relatorio' ? 'active' : ''}>
                        <span className="mdi mdi-finance"></span>
                        <text>Relatórios</text>
                    </Link>
                </li>
            </ul>
            <div id="final" className="d-flex align-items-center">
                <div className="text-right mr-3 w-100 mt-auto d-flex align-items-center justify-content-between">
                    <span className="user-name">{user.nome}</span>
                    <Dropdown title={<UserIcon />} placement="topEnd" style={{ marginRight: 10 }}>
                        <Dropdown.Item onClick={handleOpenModal} icon={<ExitIcon />}>Sair</Dropdown.Item>
                    </Dropdown>
                </div>
            </div>
            <Modal show={showLogoutModal} onHide={handleCloseModal}>
                <Modal.Header>
                    <Modal.Title>Confirmar Logout</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Você tem certeza que deseja sair?
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleConfirmLogout} appearance="primary" color="red">
                        Confirmar
                    </Button>
                    <Button onClick={handleCloseModal} appearance="subtle">
                        Cancelar
                    </Button>
                </Modal.Footer>
            </Modal>
        </sidebar>
    ) : null;
};

export default withRouter(Sidebar);
