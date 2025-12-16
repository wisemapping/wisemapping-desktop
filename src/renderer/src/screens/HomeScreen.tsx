import React, { useEffect, useState, useRef } from 'react';
import type { MindmapMetadata } from '../../../preload/index';
import {
    Container, Grid, TextField,
    IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, Box,
    CircularProgress, InputBase,
    Typography, Button, Paper, Tooltip,
    alpha
} from '@mui/material';

import {
    Add as AddIcon,
    Search as SearchIcon,
    MoreVert as MoreVertIcon,
    Brightness4,
    Brightness7
} from '@mui/icons-material';

import Logo from '../assets/logo.svg';

interface HomeScreenProps {
    onOpenMindmap: (id: string) => void;
    isDarkMode: boolean;
    onToggleTheme: () => void;
}

function HomeScreen({ onOpenMindmap, isDarkMode, onToggleTheme }: HomeScreenProps) {
    const [mindmaps, setMindmaps] = useState<MindmapMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newMapTitle, setNewMapTitle] = useState('New Mindmap');
    const [itemToDelete, setItemToDelete] = useState<{ id: string, title: string } | null>(null);

    const createInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadMindmaps();
        const unsubscribe = window.electron.ipcRenderer.on('menu:new-mindmap', () => {
            openCreateModal();
        });
        return () => {
            unsubscribe();
        };
    }, []);

    const loadMindmaps = async () => {
        setLoading(true);
        try {
            const maps = (await window.electron.ipcRenderer.invoke('mindmap:list')) as MindmapMetadata[];
            setMindmaps(maps);
        } catch (error) {
            console.error('Failed to load mindmaps:', error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setNewMapTitle('New Mindmap');
        setShowCreateModal(true);
    };

    const handleCreateSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMapTitle.trim()) return;

        setShowCreateModal(false);
        try {
            const id = (await window.electron.ipcRenderer.invoke('mindmap:create', newMapTitle)) as string;
            await loadMindmaps();
            onOpenMindmap(id);
        } catch (error) {
            console.error('Failed to create mindmap:', error);
            alert('Failed to create mindmap: ' + error);
        }
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        const id = itemToDelete.id;
        setItemToDelete(null);

        try {
            await window.electron.ipcRenderer.invoke('mindmap:delete', id);
            await loadMindmaps();
        } catch (error) {
            console.error('Failed to delete mindmap:', error);
            alert('Failed to delete mindmap');
        }
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const map = mindmaps.find(m => m.id === id);
        if (map) {
            setItemToDelete({ id: map.id, title: map.title });
        }
    };

    const handleLogoClick = () => {
        window.electron.ipcRenderer.invoke('app:open-external', 'https://www.wisemapping.com');
    }

    const filteredMindmaps = mindmaps.filter((m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
            {/* Header */}
            <Box
                sx={{
                    bgcolor: 'background.paper',
                    borderBottom: 1,
                    borderColor: 'divider',
                    px: 3,
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 }
                    }}
                    onClick={handleLogoClick}
                >
                    <img src={Logo} alt="WiseMapping" style={{ height: 32, marginRight: 16 }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                        <IconButton onClick={onToggleTheme} color="inherit">
                            {isDarkMode ? <Brightness7 /> : <Brightness4 />}
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={openCreateModal}
                        sx={{
                            bgcolor: '#ffa800',
                            '&:hover': { bgcolor: '#ffb74d' },
                            color: 'white',
                            textTransform: 'none',
                            borderRadius: 2,
                        }}
                    >
                        New Map
                    </Button>
                </Box>
            </Box>

            {/* Main Content */}
            <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4, overflowY: 'auto' }}>
                {/* Search Bar */}
                <Paper
                    component="form"
                    sx={{
                        p: '2px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        mb: 4,
                        boxShadow: 'none',
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                    }}
                >
                    <IconButton sx={{ p: '10px' }} aria-label="search">
                        <SearchIcon />
                    </IconButton>
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="Search your mindmaps..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Paper>

                {/* Grid */}
                <Grid container spacing={3}>
                    {filteredMindmaps.length === 0 ? (
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                                <Typography variant="h6">No mindmaps found</Typography>
                                <Typography variant="body2">Create a new one to get started!</Typography>
                            </Box>
                        </Grid>
                    ) : (
                        filteredMindmaps.map((map) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={map.id}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        height: '100%',
                                        border: 1,
                                        borderColor: 'divider',
                                        borderRadius: 3,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        bgcolor: 'background.paper',
                                        position: 'relative',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: theme => `0 4px 20px ${alpha(theme.palette.text.primary, 0.1)}`,
                                            borderColor: 'primary.main',
                                        },
                                    }}
                                    onClick={() => onOpenMindmap(map.id)}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            mb: 2,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                bgcolor: 'primary.light',
                                                borderRadius: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                opacity: 0.8,
                                            }}
                                        >
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                {map.title.charAt(0).toUpperCase()}
                                            </Typography>
                                        </Box>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleDelete(map.id, e)}
                                            sx={{ color: 'text.secondary' }}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </Box>
                                    <Typography
                                        variant="subtitle1"
                                        component="div"
                                        sx={{
                                            fontWeight: 600,
                                            mb: 1,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            color: 'text.primary',
                                        }}
                                    >
                                        {map.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Last edited: {new Date(map.modified).toLocaleDateString()}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))
                    )}
                </Grid>
            </Container>

            {/* Version Footer */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    bgcolor: 'background.paper',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    boxShadow: 1,
                    pointerEvents: 'none',
                    border: 1,
                    borderColor: 'divider'
                }}
            >
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    v{window.electron.appVersion}
                </Typography>
            </Box>

            {/* Create Modal */}
            <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Mindmap</DialogTitle>
                <form onSubmit={handleCreateSubmit}>
                    <DialogContent>
                        <TextField
                            inputRef={createInputRef}
                            autoFocus
                            margin="dense"
                            label="Mindmap Title"
                            fullWidth
                            variant="outlined"
                            value={newMapTitle}
                            onChange={(e) => setNewMapTitle(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowCreateModal(false)}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary" sx={{ color: 'white' }}>Create</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!itemToDelete} onClose={() => setItemToDelete(null)}>
                <DialogTitle>Delete Mindmap</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>"{itemToDelete?.title}"</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setItemToDelete(null)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default HomeScreen;
