
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import {
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Select,
    MenuItem,
    Checkbox,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Alert
} from '@mui/material';
import {
    ImageExporterFactory,
    TextExporterFactory
} from '@wisemapping/editor';
import type { SizeType, Designer, Mindmap } from '@wisemapping/editor';
import ThemeType from '@wisemapping/mindplot/src/components/model/ThemeType';

type ExportFormat = 'svg' | 'jpg' | 'png' | 'pdf' | 'txt' | 'mm' | 'mmx' | 'wxml' | 'md';
type ExportGroup = 'image' | 'document' | 'mindmap-tool';

interface ExportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    mindmap: Mindmap;
    designer?: Designer;
}

const ExportDialog = ({ isOpen, onClose, mindmap, designer }: ExportDialogProps): React.ReactElement => {
    const intl = useIntl();
    const [exportGroup, setExportGroup] = useState<ExportGroup>('image');
    const [exportFormat, setExportFormat] = useState<ExportFormat>('svg');
    const [zoomToFit, setZoomToFit] = useState<boolean>(true);
    const [isExporting, setIsExporting] = useState(false);
    const exportTheme: ThemeType = 'prism';

    const handleOnGroupChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value as ExportGroup;
        setExportGroup(value);

        let defaultFormat: ExportFormat = 'svg';
        switch (value) {
            case 'document':
                defaultFormat = 'txt';
                break;
            case 'image':
                defaultFormat = 'svg';
                break;
            case 'mindmap-tool':
                defaultFormat = 'wxml';
                break;
        }
        setExportFormat(defaultFormat);
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            let svgElement: Element | undefined;
            let size: SizeType = { width: 800, height: 600 };
            let exportMindmap = mindmap;

            // Prepare for export (theme handling, etc.)
            const originalTheme = mindmap.getTheme();

            if (designer) {
                const workspace = designer.getWorkSpace();
                svgElement = workspace.getSVGElement();
                size = designer.getWidgetManager().getContainerSize(); // Or window size

                if (originalTheme !== exportTheme) {
                    // Apply theme for export (if needed/wanted)
                    // Note: applying theme modifies the live map. 
                    // Webapp logic applies it then probably reverts or relies on reload?
                    // For now, let's respect current theme or implement temporary switch.
                    // As per webapp code, it switches theme.
                    // designer.applyTheme(exportTheme); 
                }
            }

            // Create Exporter
            let exporter;
            switch (exportFormat) {
                case 'png':
                case 'jpg':
                case 'svg':
                case 'pdf': {
                    if (!svgElement) throw new Error('Helpers not available for image export');
                    exporter = ImageExporterFactory.create(
                        exportFormat,
                        svgElement,
                        size.width,
                        size.height,
                        zoomToFit
                    );
                    break;
                }
                case 'wxml':
                case 'mm':
                case 'mmx':
                case 'md':
                case 'txt': {
                    exporter = TextExporterFactory.create(exportFormat, exportMindmap);
                    break;
                }
                default:
                    throw new Error('Unsupported format');
            }

            let content: Uint8Array;
            if (['png', 'jpg', 'pdf'].includes(exportFormat)) {
                const dataUri = await exporter.exportAndEncode();
                const base64 = dataUri.split(',')[1];
                const binaryString = window.atob(base64);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                content = bytes;
            } else {
                const textContent = await exporter.export();
                content = new TextEncoder().encode(textContent);
            }

            // Send to main process
            // We need an IPC handler 'dialog:save-file'
            const success = await window.electron.ipcRenderer.invoke('dialog:save-file', {
                content: content,
                name: `mindmap.${exportFormat}`,
                extension: exportFormat
            });

            if (success) {
                onClose();
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed: ' + error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {intl.formatMessage({ id: 'export.title', defaultMessage: 'Export' })}
            </DialogTitle>
            <DialogContent>
                <FormControl component="fieldset" fullWidth>
                    <RadioGroup value={exportGroup} onChange={handleOnGroupChange}>
                        {/* Image Group */}
                        <FormControlLabel
                            value="image"
                            control={<Radio />}
                            label={intl.formatMessage({ id: 'export.image', defaultMessage: 'Image' })}
                        />
                        {exportGroup === 'image' && (
                            <div style={{ marginLeft: 30, marginBottom: 10 }}>
                                <Select
                                    value={exportFormat}
                                    onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                                    fullWidth
                                    size="small"
                                >
                                    <MenuItem value="svg">Scalable Vector Graphics (SVG)</MenuItem>
                                    <MenuItem value="png">Portable Network Graphics (PNG)</MenuItem>
                                    <MenuItem value="jpg">JPEG Image</MenuItem>
                                    <MenuItem value="pdf">Portable Document Format (PDF)</MenuItem>
                                </Select>
                                <FormControlLabel
                                    control={<Checkbox checked={zoomToFit} onChange={(e) => setZoomToFit(e.target.checked)} />}
                                    label={intl.formatMessage({ id: 'export.img-center', defaultMessage: 'Center and zoom to fit' })}
                                />
                            </div>
                        )}

                        {/* Document Group */}
                        <FormControlLabel
                            value="document"
                            control={<Radio />}
                            label="Document"
                        />
                        {exportGroup === 'document' && (
                            <div style={{ marginLeft: 30, marginBottom: 10 }}>
                                <Select
                                    value={exportFormat}
                                    onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                                    fullWidth
                                    size="small"
                                >
                                    <MenuItem value="txt">Plain Text (TXT)</MenuItem>
                                    <MenuItem value="md">Markdown (MD)</MenuItem>
                                </Select>
                            </div>
                        )}

                        {/* Mindmap Tool Group */}
                        <FormControlLabel
                            value="mindmap-tool"
                            control={<Radio />}
                            label="Mindmap Tools"
                        />
                        {exportGroup === 'mindmap-tool' && (
                            <div style={{ marginLeft: 30, marginBottom: 10 }}>
                                <Select
                                    value={exportFormat}
                                    onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                                    fullWidth
                                    size="small"
                                >
                                    <MenuItem value="wxml">WiseMapping (WXML)</MenuItem>
                                    <MenuItem value="mm">Freemind</MenuItem>
                                    <MenuItem value="mmx">Freeplane</MenuItem>
                                </Select>
                            </div>
                        )}
                    </RadioGroup>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isExporting}>Cancel</Button>
                <Button onClick={handleExport} variant="contained" disabled={isExporting}>
                    {intl.formatMessage({ id: 'export.title', defaultMessage: 'Export' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExportDialog;
