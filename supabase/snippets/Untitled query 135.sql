SELECT 
       u.id,
       u.email, 
       p.nombre_visible
     FROM auth.users u
     LEFT JOIN public.perfiles p ON u.id = p.id;