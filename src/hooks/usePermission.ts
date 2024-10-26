export function usePermissions() {
    const { data: session } = useSession();
    
    const isAdmin = session?.user?.role === UserRole.ADMIN;
    
    const can = useCallback((action: string, resource?: any) => {
      if (isAdmin) return true;
      
      switch (action) {
        case 'create:annotation':
          return !!session?.user;
        case 'edit:annotation':
          return !!session?.user && (
            session.user.id === resource?.userId ||
            session.user.id === resource?.createdBy?.id
          );
        case 'delete:annotation':
          return !!session?.user && (
            session.user.id === resource?.userId ||
            session.user.id === resource?.createdBy?.id
          );
        case 'edit:image':
          return !!session?.user && session.user.id === resource?.userId;
        default:
          return false;
      }
    }, [session, isAdmin]);
  
    return {
      isAdmin,
      can,
    };
  }
  