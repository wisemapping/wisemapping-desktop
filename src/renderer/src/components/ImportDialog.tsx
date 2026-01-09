/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Alert,
    Typography,
    Box
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { Importer, TextImporterFactory } from '@wisemapping/editor';

interface ImportModel {
    title: string;
    description?: string;
    contentType?: string;
    content?: null | string;
}

interface ImportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess: (id: string) => void;
}

interface ErrorFile {
    error: boolean;
    message: string;
}

const defaultModel: ImportModel = { title: '' };

const ImportDialog = ({ isOpen, onClose, onImportSuccess }: ImportDialogProps): React.ReactElement => {
    const intl = useIntl();
    const [model, setModel] = useState<ImportModel>(defaultModel);
    const [errorFile, setErrorFile] = useState<ErrorFile>({ error: false, message: '' });
    const [isImporting, setIsImporting] = useState(false);

    const handleOnClose = (): void => {
        onClose();
        setModel(defaultModel);
        setErrorFile({ error: false, message: '' });
    };

    const handleOnSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();

        if (!model.content) {
            setErrorFile({
                error: true,
                message: intl.formatMessage({ id: 'import.error-no-content', defaultMessage: 'Please select a file to import.' })
            });
            return;
        }

        setIsImporting(true);
        try {
            const id = (await window.electron.ipcRenderer.invoke('mindmap:import', model.title, model.content)) as string;
            onImportSuccess(id);
            handleOnClose();
        } catch (error) {
            console.error('Failed to import mindmap:', error);
            setErrorFile({
                error: true,
                message: 'Failed to import mindmap: ' + error
            });
        } finally {
            setIsImporting(false);
        }
    };

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = event.target;
        setModel(prev => ({ ...prev, [name]: value }));
    };

    const handleOnFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event?.target?.files;
        const reader = new FileReader();

        if (files && files.length > 0) {
            const file = files[0];
            const extensionFile = file.name.split('.').pop()?.toLowerCase();

            reader.onload = (event) => {
                const fileName = file.name;
                if (fileName) {
                    const title = fileName.split('.')[0];
                    if (!model.title || model.title.length === 0) {
                        setModel(prev => ({ ...prev, title }));
                    }
                }

                const extensionAccept = ['wxml', 'mm', 'mmx', 'xmind', 'mmap', 'opml'];

                if (!extensionFile || !extensionAccept.includes(extensionFile)) {
                    setErrorFile({
                        error: true,
                        message: intl.formatMessage(
                            {
                                id: 'import.error-file',
                                defaultMessage: 'Import error {error}',
                            },
                            {
                                error: 'You can import WiseMapping, FreeMind, Freeplane, XMind, MindManager, and OPML maps. Select the file you want to import.',
                            },
                        ),
                    });
                    return;
                }

                const fileContent = event?.target?.result;
                let mapContent: string | ArrayBuffer;
                if (typeof fileContent === 'string') {
                    mapContent = fileContent;
                } else if (fileContent instanceof ArrayBuffer) {
                    mapContent = fileContent;
                } else {
                    mapContent = '';
                }

                try {
                    const importer: Importer = TextImporterFactory.create(extensionFile, mapContent);
                    const titleToUse = (!model.title || model.title.length === 0) ? fileName!.split('.')[0] : model.title;

                    importer.import(titleToUse, model.description || '').then((res: string) => {
                        setModel(prev => ({ ...prev, content: res }));
                        setErrorFile({ error: false, message: '' });
                    });
                } catch (e: any) {
                    setErrorFile({
                        error: true,
                        message: intl.formatMessage(
                            {
                                id: 'import.error-file',
                                defaultMessage: 'Import error {error}',
                            },
                            {
                                error: e.message,
                            },
                        ),
                    });
                }
            };

            if (extensionFile === 'xmind') {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsText(file);
            }
        }
    };

    return (
        <Dialog open={isOpen} onClose={handleOnClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {intl.formatMessage({
                    id: 'import.title',
                    defaultMessage: 'Import existing mindmap',
                })}
            </DialogTitle>
            <form onSubmit={handleOnSubmit}>
                <DialogContent>

                    <Typography variant="body2" color="textSecondary" paragraph>
                        {intl.formatMessage({
                            id: 'import.description',
                            defaultMessage: 'You can import WiseMapping, FreeMind, Freeplane, XMind, MindManager, and OPML maps to your list of maps. Select the file you want to import.',
                        })}
                    </Typography>

                    {errorFile.error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {errorFile.message}
                        </Alert>
                    )}

                    <Box sx={{ mb: 2 }}>
                        <input
                            accept=".wxml,.mm,.mmx,.xmind,.mmap,.opml"
                            id="contained-button-file"
                            type="file"
                            style={{ display: 'none' }}
                            onChange={handleOnFileChange}
                        />
                        <label htmlFor="contained-button-file">
                            <Button
                                variant="outlined"
                                color="primary"
                                component="span"
                                fullWidth
                            >
                                <FormattedMessage id="maps.choose-file" defaultMessage="Choose a file" />
                            </Button>
                        </label>
                        {/* Show selected file name if possible, or reliance on Title filling is enough feedback */}
                    </Box>

                    <TextField
                        autoFocus
                        margin="dense"
                        name="title"
                        label={intl.formatMessage({
                            id: 'action.rename-name-placeholder',
                            defaultMessage: 'Name',
                        })}
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={model.title}
                        onChange={handleOnChange}
                        required
                    />

                    <TextField
                        margin="dense"
                        name="description"
                        label={intl.formatMessage({
                            id: 'action.rename-description-placeholder',
                            defaultMessage: 'Description',
                        })}
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={model.description || ''}
                        onChange={handleOnChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleOnClose} disabled={isImporting}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="primary" disabled={isImporting || !model.content || errorFile.error}>
                        {intl.formatMessage({ id: 'import.button', defaultMessage: 'Import' })}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ImportDialog;
