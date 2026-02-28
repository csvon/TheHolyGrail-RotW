import { CSSProperties, ReactText, useEffect, useRef, useState } from "react";
import { toast } from 'material-react-toastify';
import DownloadIcon from '@mui/icons-material/Download';
import packageJson from "../../../package.json";
import { Trans } from "react-i18next";
import { Button } from "@mui/material";
import { Progress } from "electron-dl";

const GITHUB_LATEST_RELEASE = 'https://api.github.com/repos/csvon/TheHolyGrail-RotW/releases/latest';
const GITHUB_RELEASES_LATEST_PAGE = 'https://github.com/csvon/TheHolyGrail-RotW/releases/latest';
const MANUAL_UPDATE_CHECK_EVENT = 'thg:check-updates';
const UPDATE_TOAST_CLASS = 'thg-update-toast';
const UPDATE_TOAST_STYLE: CSSProperties = {
    background: '#1d1f23',
    color: '#f3f5f7',
    border: '1px solid #343741',
};

type GitHubRelease = {
    name: string,
    html_url?: string,
    assets: Array<{
        browser_download_url: string,
    }>,
}

const isNewVersionAvailable = (currentVersion:string, candidateVersion: string): boolean => {
    if (currentVersion === candidateVersion) return false;
    const candidate = candidateVersion.replace('v', '').split('.');
    const current = currentVersion.replace('v', '').split('.');
    for (let i = 0; i < current.length; i++) {
        const a = current[i] ? parseInt(current[i]) : 0;
        const b = candidate[i] ? parseInt(candidate[i]) : 0;
        if (a > b) return false;
        if (a < b) return true;
    }
    return false;
}

const VersionCheck = () => {
    const toastId = useRef<ReactText|null>(null);
    const newVersionUrl = useRef('');
    const releaseNotesUrl = useRef(GITHUB_RELEASES_LATEST_PAGE);
    const [ isDownloading, setIsDownloading ] = useState(false);
    const isDownloadingRef = useRef(false);
    const currentVersion = packageJson.version;
    const clearToastId = () => {
        toastId.current = null;
    };

    const NewVersionButton = () => {
        return <div style={{ paddingRight: 15 }}>
            <Button
                onClick={() => {
                    if (!newVersionUrl.current) {
                        window.Main.openUrl(releaseNotesUrl.current);
                    } else {
                        window.Main.downloadNewVersion(newVersionUrl.current);
                        setIsDownloading(true);
                    }
                }}
                variant="text"
                sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    color: 'inherit',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    },
                }}
            >
                <DownloadIcon/>
                <Trans>New version is available, click here to download.</Trans>
            </Button>
            <Button
                onClick={() => {
                    window.Main.openUrl(releaseNotesUrl.current);
                }}
                variant="text"
                sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    color: 'inherit',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    },
                }}
            >
                View release notes
            </Button>
        </div>
    }

    const toastNewVersionButton = (): ReactText => {
        if (toastId.current !== null && toast.isActive(toastId.current)) {
            toast.update(toastId.current, {
                render: <NewVersionButton />,
                hideProgressBar: true,
                progress: 0,
                theme: 'dark',
                className: UPDATE_TOAST_CLASS,
                style: UPDATE_TOAST_STYLE,
                onClose: clearToastId,
            });
            return toastId.current;
        } else {
            const nextToastId = toast(<NewVersionButton />, {
                position: "bottom-center",
                autoClose: false,
                hideProgressBar: true,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: false,
                theme: 'dark',
                className: UPDATE_TOAST_CLASS,
                style: UPDATE_TOAST_STYLE,
                onClose: clearToastId,
            });
            toastId.current = nextToastId;
            return nextToastId;
        }
    }

    const checkForUpdates = (manual = false) => {
        const checkingToastId = manual ? toast.info('Checking for updates...', {
            autoClose: false,
            hideProgressBar: true,
            closeOnClick: false,
            draggable: false,
        }) : null;

        const dismissCheckingToast = () => {
            if (checkingToastId !== null) {
                toast.dismiss(checkingToastId);
            }
        };

        fetch(GITHUB_LATEST_RELEASE)
            .then((response) => response.json())
            .then((release: GitHubRelease & { message?: string }) => {
                if (!release?.name || !Array.isArray(release.assets)) {
                    dismissCheckingToast();
                    if (manual) {
                        toast.error('Could not check for updates.');
                    }
                    return;
                }

                if (isNewVersionAvailable(currentVersion, release.name)) {
                    releaseNotesUrl.current = release.html_url || GITHUB_RELEASES_LATEST_PAGE;

                    const isWin = window.Main.isWindows();
                    const setupAsset = release.assets.find(asset => asset.browser_download_url.includes(isWin ? 'win' : 'darwin'));
                    if (setupAsset) {
                        newVersionUrl.current = setupAsset.browser_download_url;
                    } else {
                        newVersionUrl.current = '';
                    }

                    if (!isDownloadingRef.current) {
                        toastNewVersionButton();
                    }

                    if (!setupAsset && manual) {
                        toast.info('Update found, installer not available for this platform. Opening release notes is still available.');
                    }

                    dismissCheckingToast();
                    return;
                }

                dismissCheckingToast();
                if (manual) {
                    toast.info(`You are on the latest version (v${currentVersion}).`);
                }
            })
            .catch(() => {
                dismissCheckingToast();
                if (manual) {
                    toast.error('Could not check for updates.');
                }
                console.log('Could not check for new version');
            });
    };

    useEffect(() => {
        isDownloadingRef.current = isDownloading;
    }, [isDownloading]);

    useEffect(() => {
        const handleManualUpdateCheck = () => {
            checkForUpdates(true);
        };

        checkForUpdates(false);
        window.addEventListener(MANUAL_UPDATE_CHECK_EVENT, handleManualUpdateCheck);

        window.Main.on('downloadProgress', (progress: Progress) => {
            if(toastId.current !== null) {
                toast.update(toastId.current, {
                    hideProgressBar: false,
                    progress: progress.percent,
                    render: <Button onClick={() => {
                        window.Main.cancelDownload();
                        setIsDownloading(false);
                    }}
                        sx={{
                            color: 'inherit',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            },
                        }}
                    >
                        <Trans>Downloading installer... Click here to cancel</Trans>
                    </Button>,
                    theme: 'dark',
                    className: UPDATE_TOAST_CLASS,
                    style: UPDATE_TOAST_STYLE,
                });
            }
        });

        return () => {
            window.removeEventListener(MANUAL_UPDATE_CHECK_EVENT, handleManualUpdateCheck);
        };
    }, []);

    return null;
}

export default VersionCheck;
