SELECT 
       u.id AS auth_id, 
       u.email, 
       p.id AS perfil_id, 
       p.nombre_visible, 
       p.creado_en, 
       p.avatar_ruta, 
       p.zona_id
     FROM auth.users u
     LEFT JOIN public.perfiles p ON u.id = p.id;