import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import {
    Box,
    Card,
    Stack,
    Button,
    Dialog,
    Divider,
    MenuItem,
    MenuList,
    Typography,
    IconButton,
    DialogTitle,
    DialogActions,
    DialogContent,
    DialogContentText,
    CircularProgress,
    Tooltip,
    Skeleton,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { fDate } from 'src/utils/format-time';
import { deleteStage, fetchStages } from 'src/redux/slices/stages';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

export function StageDetails() {
    const popover = usePopover();
    const { id: stage_id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const stages = useSelector((state) => state.stages.stages);
    const stage = stages.find((s) => s.id === stage_id);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await dispatch(fetchStages());
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [dispatch]);

    const handleDeleteStage = () => setOpenConfirmDialog(true);

    const confirmDelete = async () => {
        setOpenConfirmDialog(false);
        setDeleting(true);
        try {
            await dispatch(deleteStage(stage_id));
            navigate(paths.dashboard.stages.root); 
        } catch (error) {
            console.error('Error deleting stage:', error);
            alert('Failed to delete stage. Please try again later.');
        } finally {
            setDeleting(false);
            popover.onClose();
        }
    };

    const cancelDelete = () => setOpenConfirmDialog(false);

    const handleEditStage = () => {
        navigate(paths.dashboard.stages.edit(stage_id));
    };

    if (loading) {
        return (
            <Card sx={{ p: 3, borderRadius: 2, bgcolor: 'background.default' }}>
                <Skeleton variant="text" width="60%" height={40} />
                <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2 }} />
            </Card>
        );
    }

    if (!stage) {
        return <Typography variant="h6">Stage not found</Typography>;
    }

    return (
        <>
            <Card
                sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: 'background.default',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                    }}
                >
                    <Stack spacing={0.5}>
                        <Typography variant="h5">{stage.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {stage.description || 'No description available'}
                        </Typography>
                    </Stack>
                    <Tooltip title="More actions">
                        <IconButton onClick={popover.onOpen} color="inherit">
                            <Iconify icon="eva:more-vertical-fill" />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Stack
                    spacing={14}
                    direction={{ xs: 'column', sm: 'row' }}
                    divider={<Divider orientation="vertical" flexItem />}
                >
                    {[
                        { label: 'Start Date', value: fDate(stage.startDate) },
                        { label: 'End Date', value: fDate(stage.endDate) },
                        { label: 'Actual Start Date', value: fDate(stage.actualStartDate) },
                        { label: 'Actual End Date', value: fDate(stage.actualEndDate) },
                    ].map((detail, index) => (
                        <Box key={index}>
                            <Typography variant="subtitle1" color="text.secondary">
                                {detail.label}
                            </Typography>
                            <Typography variant="subtitle2">{detail.value || 'N/A'}</Typography>
                        </Box>
                    ))}
                </Stack>
            </Card>

            <CustomPopover
                open={popover.open}
                anchorEl={popover.anchorEl}
                onClose={popover.onClose}
            >
                <MenuList>
                    <MenuItem onClick={handleEditStage}>
                        <Iconify icon="solar:pen-bold" sx={{ mr: 1 }} />
                        Edit Stage
                    </MenuItem>
                    <MenuItem onClick={handleDeleteStage} sx={{ color: 'error.main' }}>
                        <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 1 }} />
                        Delete Stage
                    </MenuItem>
                </MenuList>
            </CustomPopover>

            <Dialog open={openConfirmDialog} onClose={cancelDelete}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this stage? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelDelete} variant="outlined" color="inherit">
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDelete}
                        variant="contained"
                        color="error"
                        disabled={deleting}
                    >
                        {deleting ? <CircularProgress size={24} /> : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
