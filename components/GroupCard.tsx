"use client"
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Edit, Trash2, MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {deteleCalendarGroup} from "@/actions/group";
import {toast} from "sonner";


interface GroupCardProps {
    id: string;
    name: string;
    calendarCount?: number;
    createdAt?: Date;
    description: string | null;
}

export function GroupCard({id, name, calendarCount = 0, createdAt, description}: GroupCardProps) {

    const handleClick = () => {
    };

    const handleEdit = async (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    async function handleDelete(e: React.MouseEvent){
        e.stopPropagation();
        try {
            const res = await deteleCalendarGroup(id)
            if (!res.success){
                toast.error(res.message)
                return;
            }
            toast.success(res.message)
        }
        catch (error){
            console.log(error)
            toast.error("Something went wrong");
        }
    }

    return (
    <Link href={`/dashboard/calendars/groups/${id}`}>
        <Card
            className="group hover:shadow-xl transition-all duration-300 hover:border-primary/60 cursor-pointer overflow-hidden bg-gradient-to-br from-card to-card/50"
            onClick={handleClick}
        >
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <div>
                                <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                                    {name}
                                </h3>
                                {description && (
                                    <p className="text-sm text-muted-foreground line-clamp-1 mb-1 sm:block hidden">
                                        {description}
                                    </p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    {calendarCount} {calendarCount === 1 ? 'calendar' : 'calendars'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleEdit}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={handleDelete}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {createdAt && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border/50 pt-4">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Created {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    </Link>
    );
}