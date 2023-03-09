<script>
	import { primaryNavItems } from '$consts/navigation';
</script>

<ul>
	{#each primaryNavItems as navItem}
		<li><a href={navItem.path}>{navItem.name}</a></li>
	{/each}
</ul>
