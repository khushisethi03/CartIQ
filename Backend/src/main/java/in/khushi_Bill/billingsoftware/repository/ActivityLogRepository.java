package in.khushi_Bill.billingsoftware.repository;

import in.khushi_Bill.billingsoftware.entity.ActivityLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLogEntity, Long> {

    List<ActivityLogEntity> findByUserIdOrderByTimestampDesc(Long userId);
}
