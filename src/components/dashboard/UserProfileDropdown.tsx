"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Settings,
  Shield,
  FileText,
  Trash2,
  LogOut,
} from "lucide-react";

export function UserProfileDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-muted transition-colors cursor-pointer" />
        }
      >
        <Avatar className="h-8 w-8 border-2 border-primary/20">
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            U
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5">
        <div className="px-3 py-2">
          <p className="text-sm font-medium">Usuário</p>
          <p className="text-xs text-muted-foreground">usuario@empresa.com</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2.5 cursor-pointer rounded-lg">
          <Settings className="h-4 w-4" />
          Configurações da Conta
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* LGPD / GDPR Compliance Items */}
        <DropdownMenuItem className="gap-2.5 cursor-pointer rounded-lg">
          <Shield className="h-4 w-4" />
          Política de Privacidade
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2.5 cursor-pointer rounded-lg">
          <FileText className="h-4 w-4" />
          Termos de Serviço
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2.5 cursor-pointer rounded-lg text-destructive focus:text-destructive">
          <Trash2 className="h-4 w-4" />
          Excluir Meus Dados
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2.5 cursor-pointer rounded-lg">
          <LogOut className="h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
