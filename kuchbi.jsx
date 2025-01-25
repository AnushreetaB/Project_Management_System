import dayjs from 'dayjs';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers';
import { Card, Stack, Divider, TextField, CardHeader, CardContent } from '@mui/material';
import { paths } from 'src/routes/paths';
import { useBoolean } from 'src/hooks/use-boolean';
import { setStage, fetchStages, updateStage } from 'src/redux/slices/stages';
import { toast } from 'src/components/snackbar';

const STATE = {
    stageName: '',
    description: '',
    startDate: dayjs(),
    endDate: dayjs(),
    actualStartDate: dayjs(),
    actualEndDate: dayjs(),
    stageId: null, 
};

export default function StageCreateForm() {
    const [formData, setFormData] = useState(STATE);
    const loading = useBoolean();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { stage_id } = useParams();

    const stages = useSelector((state) => state.stages.stages);

    const stageToEdit = stage_id ? stages.find((stage) => stage.id === stage_id) : null;

    useEffect(() => {
        if (stage_id) {
            if (stageToEdit) {
                setFormData({
                    stageId: stageToEdit.id, 
                    stageName: stageToEdit.title,
                    description: stageToEdit.description,
                    startDate: dayjs(stageToEdit.startDate),
                    endDate: dayjs(stageToEdit.endDate),
                    actualStartDate: dayjs(stageToEdit.actualStartDate),
                    actualEndDate: dayjs(stageToEdit.actualEndDate),
                });
            }
        } else {
            dispatch(fetchStages());
        }
    }, [dispatch, stage_id, stageToEdit]);

    const handleFormData = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name, newValue) => {
        setFormData((prev) => ({
            ...prev,
            [name]: newValue,
        }));
    };

    const handleSubmit = async () => {
        loading.onTrue();

        const dataToSend = {
            stage_id: formData.stageId, 
            name: formData.stageName,
            description: formData.description,
            start_date: formData.startDate.format('YYYY-MM-DD'),
            end_date: formData.endDate.format('YYYY-MM-DD'),
            actual_start_date: formData.actualStartDate.format('YYYY-MM-DD'),
            actual_end_date: formData.actualEndDate.format('YYYY-MM-DD'),
        };

        try {
            const endpoint = formData.stageId
                ? `http://127.0.0.1:5000/stage/updatestage`
                : `http://127.0.0.1:5000/stage/createstage`;

            const method = formData.stageId ? 'put' : 'post';

            const response = await axios[method](endpoint, dataToSend);

            const { message, error, data } = response.data;


            if (error === 0) {
                if (formData.stageId) {
                    dispatch(updateStage(data));
                    toast.success('Stage updated successfully!');
                } else {
                    dispatch(setStage({ name: data.stage_name, id: data.stage_id }));
                    toast.success('Stage created successfully!');
                }
                navigate(paths.dashboard.stages.create.replace(':stage_id?', data.stage_id || ''));
            } else {
                toast.error(message);
            }
        } catch (err) {
            console.error(err);
            toast.error('Unable to process');
        } finally {
            loading.onFalse();
        }
    };

    return (
        <Card sx={{ mx: 'auto', width: '80%' }}>
            <CardHeader
                title={stage_id ? 'Edit Stage' : 'Create Stage'}
                subheader="Title, short description, dates ..."
                sx={{ mb: 3 }}
            />
            <Divider />
            <CardContent>
                <Stack gap={4}>
                    <TextField
                        fullWidth
                        name="stageName"
                        label="Stage Name"
                        variant="outlined"
                        value={formData.stageName}
                        onChange={handleFormData}
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={5}
                        label="Description"
                        variant="outlined"
                        name="description"
                        value={formData.description}
                        onChange={handleFormData}
                    />
                    <Stack direction="row" gap={2}>
                        <DatePicker
                            label="Start Date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={(newValue) => handleDateChange('startDate', newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    variant="outlined"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: params.InputProps?.endAdornment,
                                    }}
                                />
                            )}
                            sx={{ flexGrow: 1 }}
                        />
                        <DatePicker
                            label="End Date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={(newValue) => handleDateChange('endDate', newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    variant="outlined"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: params.InputProps?.endAdornment,
                                    }}
                                />
                            )}
                            sx={{ flexGrow: 1 }}
                        />
                    </Stack>

                    <Stack direction="row" gap={2}>
                        <DatePicker
                            label="Actual Start Date"
                            name="actualstartdate"
                            value={formData.actualStartDate}
                            onChange={(newValue) => handleDateChange('actualStartDate', newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    variant="outlined"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: params.InputProps?.endAdornment,
                                    }}
                                />
                            )}
                            sx={{ flexGrow: 1 }}
                        />
                        <DatePicker
                            label="Actual End Date"
                            name="actualenddate"
                            value={formData.actualEndDate}
                            onChange={(newValue) => handleDateChange('actualEndDate', newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    variant="outlined"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: params.InputProps?.endAdornment,
                                    }}
                                />
                            )}
                            sx={{ flexGrow: 1 }}
                        />
                    </Stack>

                    <LoadingButton
                        variant="contained"
                        onClick={handleSubmit}
                        size="medium"
                        sx={{
                            alignSelf: 'flex-end',
                        }}
                        loading={loading.value}
                    >
                        {stage_id ? 'Update Stage' : 'Save Stage'}
                    </LoadingButton>
                </Stack>
            </CardContent>
        </Card>
    );
}
