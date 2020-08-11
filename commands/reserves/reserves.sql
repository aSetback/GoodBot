SELECT 
    s.player, 
    rr.raidID, 
    r.raid, 
    ri.itemID, 
    ri.name, 
    r.date 
FROM 
    signups s 
    LEFT JOIN raid_reserves rr ON s.id = rr.signupID 
    LEFT JOIN raids r ON rr.raidID = r.id 
    LEFT JOIN reserve_items ri ON rr.reserveItemID = ri.id 
WHERE 
    s.player = 'Taunt' 
    AND r.id IS NOT NULL;