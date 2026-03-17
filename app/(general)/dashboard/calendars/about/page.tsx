import { Calendar, ArrowRight, RefreshCw, Settings, Zap, Clock } from 'lucide-react';

export default function HelpPage() {
    return (
        <div className="min-h-screen p-8 max-w-5xl mx-auto">
            <div className="mb-12">
                <h1 className="text-3xl font-bold tracking-tight mb-2">How It Works</h1>
                <p className="text-muted-foreground">
                    Understanding calendar groups and automatic sync
                </p>
            </div>

            <div className="bg-white border rounded-xl p-8 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Calendar Groups</h2>
                </div>

                <p className="text-muted-foreground mb-6">
                    A calendar group copies events from your primary calendar to multiple secondary calendars automatically.
                    Create an event once, see it everywhere.
                </p>

                <div className="bg-muted/50 rounded-lg p-6">
                    <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium">Primary Calendar</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Secondary Calendars</span>
                    </div>
                </div>
            </div>

            <div className="bg-white border rounded-xl p-8 mb-6">
                <h2 className="text-2xl font-bold mb-6">Setup</h2>

                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                            1
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Connect calendars</h3>
                            <p className="text-sm text-muted-foreground">
                                Add your Google, Microsoft, or Apple accounts in Settings
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                            2
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Create a group</h3>
                            <p className="text-sm text-muted-foreground">
                                Pick one calendar as primary, add others as secondary
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                            3
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Configure sync</h3>
                            <p className="text-sm text-muted-foreground">
                                Set how often to sync and enable automatic mode
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border rounded-xl p-8 mb-6">
                <h2 className="text-2xl font-bold mb-6">Features</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex gap-3">
                        <RefreshCw className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold mb-1">Automatic sync</h3>
                            <p className="text-sm text-muted-foreground">
                                Syncs every 15min, 30min, 1hr, or 2hrs - your choice
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold mb-1">Manual sync</h3>
                            <p className="text-sm text-muted-foreground">
                                Click Synchronize anytime to sync instantly
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Settings className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold mb-1">Duplicate handling</h3>
                            <p className="text-sm text-muted-foreground">
                                Updates existing events instead of creating duplicates
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold mb-1">Sync logs</h3>
                            <p className="text-sm text-muted-foreground">
                                View what changed in every sync operation
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border rounded-xl p-8 mb-6">
                <h2 className="text-2xl font-bold mb-6">Questions</h2>

                <div className="space-y-6">

                    <div>
                        <h3 className="font-semibold mb-2">Can I edit events in secondary calendars?</h3>
                        <p className="text-sm text-muted-foreground">
                            Yes, but changes won't sync back. Always edit in your primary calendar
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Can I have multiple groups?</h3>
                        <p className="text-sm text-muted-foreground">
                            Yes! Each group can have different calendars
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}